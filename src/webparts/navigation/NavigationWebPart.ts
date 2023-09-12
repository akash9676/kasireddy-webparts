import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneDropdown,
  PropertyPaneLabel,
  PropertyPaneLink,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "NavigationWebPartStrings";
import Navigation from "./components/Navigation";
import { INavigationProps } from "./components/INavigationProps";
import { fetchList } from "../../api/fetchList";
import { fetchListCategory } from "../../api/fetchListCategory";
import { getListUrl } from "../common/getListUrl";
import { PropertyPaneCustomCreateList } from "../common/pannelControl/PropertyPaneCustomCreateList";
import { NavigationAPI } from "../../api/navigationApi";

export interface INavigationWebPartProps {
  listName: string;
  description: string;
  name: string;
  parentId: boolean;
  id: number;
  category: string;
  txtListName: string;
  message: string;
}

export default class NavigationWebPart extends BaseClientSideWebPart<INavigationWebPartProps> {
  //vars to hold a list of lists and a list of columns for a given list
  private listOptions: IPropertyPaneDropdownOption[];
  private listCategoryOptions: IPropertyPaneDropdownOption[];
  private message: string = "";
  public render(): void {
    const element: React.ReactElement<INavigationProps> = React.createElement(
      Navigation,
      {
        context: this.context,
        listName: this.properties.listName,
        description: this.properties.description,
        name: this.properties.name,
        parentId: this.properties.parentId,
        id: this.properties.id,
        category: this.properties.category,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
  private loadCategoryItems(): void {
    fetchListCategory(
      this.context.spHttpClient,
      this.context.pageContext.web.absoluteUrl,
      this.properties.listName
    ).then((lists: IPropertyPaneDropdownOption[]) => {
      this.listCategoryOptions = lists;

      //this.properties.category = lists[0].text;
      // // re-render the web part as clearing the loading indicator removes the web part body
      // this.render();
      // // refresh the item selector control by repainting the property pane
      this.context.propertyPane.refresh();
    });
  }

  //triggered when the pane is starting to be configured
  protected onPropertyPaneConfigurationStart(): void {
    this.clearFields();
    //go and load up dynamic list data
    this.GetNavigationList();
  }

  protected onPropertyPaneFieldChanged(
    propertyPath: string,
    oldValue: any,
    newValue: any
  ): void {
    if (propertyPath === "listName" && newValue) {
      this.loadCategoryItems();
      // push new list value
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      // get previously selected item
      const previousItem: string = this.properties.category;
      // reset selected item
      // this.properties.category = "All";
      // push new item value
      this.onPropertyPaneFieldChanged(
        "category",
        previousItem,
        this.properties.category
      );

      if (oldValue !== newValue) {
        this.properties.category = this.listCategoryOptions[0].text;
      }
      this.context.propertyPane.refresh();
    } else {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    }
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    let categoryControl: any[] = [];
    if (this.listCategoryOptions && this.listCategoryOptions.length > 1) {
      categoryControl = [
        PropertyPaneDropdown("category", {
          label: strings.CategoryFieldLabel,
          options: this.listCategoryOptions,
          selectedKey: this.properties.category,
        }),
      ];
    }
    return {
      pages: [
        {
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName: strings.BasicGroupName,
              isCollapsed: false,
              groupFields: [
                PropertyPaneDropdown("listName", {
                  label: strings.ListNameFieldLabel,
                  options: this.listOptions,
                  selectedKey: this.properties.listName,
                }),
                PropertyPaneLink("ListUrl", {
                  text: `${strings.GoToTextFieldLabel} ${this.properties.listName} ${strings.ListNameFieldLabel}`,
                  href: getListUrl(
                    false,
                    this.properties.listName,
                    this.context.pageContext.web.absoluteUrl
                  ),
                  target: "_blank",
                }),
                ...categoryControl,
              ],
            },
            {
              groupName: strings.CreateListGroupName,
              isCollapsed: true,
              groupFields: [
                PropertyPaneTextField("txtListName", {
                  label: strings.CreateListNameFieldLabel,
                }),
                PropertyPaneButton("btnCreate", {
                  text: strings.CreateButtonNameFieldLabel,
                  buttonType: PropertyPaneButtonType.Primary,
                  onClick: this.buttonClick.bind(this),
                }),
                PropertyPaneLabel("labelField", {
                  text: this.properties.message,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
  private clearFields() {
    this.properties.txtListName = "";
    this.properties.message = "";
  }
  private GetNavigationList() {
    //go and load up dynamic list data
    fetchList(
      this.context.spHttpClient,
      this.context.pageContext.web.absoluteUrl
    ).then((lists: IPropertyPaneDropdownOption[]) => {
      this.listOptions = lists;
      if (this.properties.listName) {
        this.loadCategoryItems();
      }
      //else no list pre selected, so we can continue
      this.context.propertyPane.refresh();
      this.render();
    });
  }
  private buttonClick(oldValue: any): any {
    let value = this.properties.txtListName;
    if (value === "") {
      return;
    }
    let api = new NavigationAPI();
    api.createNavigationList(
      this.context.spHttpClient,
      this.context.pageContext.web.absoluteUrl,
      value,
      (data) => {
        api.addColumns(
          this.context.spHttpClient,
          this.context.pageContext.web.absoluteUrl,
          value,
          (data) => {
            api.addSampleData(
              value,
              this.context.pageContext.web.absoluteUrl,
              this.context.spHttpClient,
              (data) => {
                this.GetNavigationList();
                this.properties.message = data;
                this.context.propertyPane.refresh();
              },
              (error) => {
                this.properties.message = error;
              }
            );
          }
        );
      },
      (errorMsg) => {
        this.properties.message = errorMsg;
        this.context.propertyPane.refresh();
      }
    );
    return this.properties.message;
  }
}
