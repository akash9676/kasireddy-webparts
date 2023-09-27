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
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "TilesWebPartStrings";
import Tiles from "./components/Tiles";
import { ITilesProps } from "./components/ITilesProps";
import {
  ColumnTypes,
  textPosition,
  titlePosition,
  ViewType,
} from "./components/enums";
import {
  getSeeMoreProp,
  SeeMoreGroupSettings,
} from "../../settings/seeMoreSettings/SeeMoreSettings";
import { ISeeMoreSettings } from "../../settings/seeMoreSettings/ISeeMoreSettings";
import { fetchDocumentList } from "../../api/fetchDocumentList";
import { fetchListCategory } from "../../api/fetchListCategory";
import { getListUrl } from "../../utils/common/getListUrl";
import { TileAPI } from "../../api/tile/tileApi";

export interface ITilesWebPartProps extends ISeeMoreSettings {
  listName: string;
  viewType: string;
  columns: string;
  description: string;
  titlePosition: string;
  textPosition: string;
  separator: boolean;
  category: string;
  txtListName: string;
  message: string;
  overlayTransparent: string;
  autoHeight: boolean;
  numberOfLine: string;
}

export default class TilesWebPart extends BaseClientSideWebPart<ITilesWebPartProps> {
  //vars to hold a list of lists and a list of columns for a given list
  private listOptions: IPropertyPaneDropdownOption[];
  private listCategoryOptions: IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<ITilesProps> = React.createElement(
      Tiles,
      {
        context: this.context,
        listName: this.properties.listName,
        viewType: this.properties.viewType,
        columns: this.properties.columns,
        description: this.properties.description,
        titlePosition: this.properties.titlePosition,
        textPosition: this.properties.textPosition,
        separator: this.properties.separator,
        category: this.properties.category,
        ...getSeeMoreProp(this.properties),
        overlayTransparent: this.properties.overlayTransparent,
        autoHeight: this.properties.autoHeight,
        numberOfLine: this.properties.numberOfLine,
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
      this.context.propertyPane.refresh();
    });
  }

  //triggered when the pane is starting to be configured
  protected onPropertyPaneConfigurationStart(): void {
    this.clearFields();
    //go and load up dynamic list data
    this.getTileList();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    let group: any[] = [];
    let categoryControl: any[] = [];
    let overlayControl: any[] = [];
    let autoHeightControl: any[] = [];
    this.properties.viewType = ViewType.square;

    if (this.properties.autoHeight) {
      autoHeightControl = [
        PropertyPaneSlider("numberOfLine", {
          label: "Number Of Description Lines",
          min: 1,
          max: 5,
          showValue: true,
          step: 1,
        }),
      ];
    }
    if (this.properties.textPosition === textPosition.overlay) {
      overlayControl = [
        PropertyPaneToggle("autoHeight", {
          key: "autoHeight",
          label: "Overlay Text Auto Height",
          onText: "True",
          offText: "False",
        }),
        ...autoHeightControl,
        PropertyPaneSlider("overlayTransparent", {
          label: strings.OverlayTransparentFieldLabel,
          min: 0,
          max: 1,
          showValue: true,
          step: 0.1,
        }),
      ];
    }
    if (this.listCategoryOptions && this.listCategoryOptions.length > 1) {
      categoryControl = [
        PropertyPaneDropdown("category", {
          label: strings.CategoryFieldLabel,
          options: this.listCategoryOptions,
          selectedKey: this.properties.category,
        }),
      ];
      group = [
        {
          groupName: strings.AdvancedGroupName,
          isCollapsed: true,
          groupFields: [
            PropertyPaneDropdown("titlePosition", {
              label: strings.TitlePositionFieldLabel,
              options: [
                {
                  key: "left",
                  text: strings.LeftFieldLabel,
                },
                {
                  key: "center",
                  text: strings.CenterFieldLabel,
                },
                {
                  key: "right",
                  text: strings.RightFieldLabel,
                },
              ],
            }),
            PropertyPaneDropdown("viewType", {
              label: strings.ViewTypeFieldLabel,
              options: [
                {
                  key: ViewType.square,
                  text: strings.viewTypeStyle1,
                },
                {
                  key: ViewType.circle,
                  text: strings.viewTypeStyle2,
                },
              ],
            }),
            PropertyPaneDropdown("textPosition", {
              label: strings.TextPositionFieldLabel,
              options:
                this.properties.viewType === ViewType.square
                  ? [
                      {
                        key: textPosition.overlay,
                        text: strings.OverlayFieldLabel,
                      },
                      {
                        key: textPosition.left,
                        text: strings.LeftFieldLabel,
                      },
                      {
                        key: textPosition.right,
                        text: strings.RightFieldLabel,
                      },
                      {
                        key: textPosition.bottom,
                        text: strings.BottomFieldLabel,
                      },
                    ]
                  : [
                      {
                        key: textPosition.left,
                        text: strings.LeftFieldLabel,
                      },
                      {
                        key: textPosition.right,
                        text: strings.RightFieldLabel,
                      },
                      {
                        key: textPosition.bottom,
                        text: strings.BottomFieldLabel,
                      },
                    ],
            }),
            ...overlayControl,
            PropertyPaneDropdown("columns", {
              label: strings.ColumnFieldLabel,
              options: [
                {
                  key: ColumnTypes.columns1,
                  text: strings.Column1FieldLabel,
                },
                {
                  key: ColumnTypes.columns2,
                  text: strings.Column2FieldLabel,
                },
                {
                  key: ColumnTypes.columns3,
                  text: strings.Column3FieldLabel,
                },
                {
                  key: ColumnTypes.columns4,
                  text: strings.Column4FieldLabel,
                },
              ],
            }),
            PropertyPaneToggle("separator", {
              key: "separator",
              label: strings.SeparatorFieldLabel,
              onText: strings.EnableFieldLabel,
              offText: strings.NoEnableFieldLabel,
            }),
          ],
        },
        SeeMoreGroupSettings(strings, this.properties),
      ];
    }
    return {
      pages: [
        {
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
                PropertyPaneDropdown("listName", {
                  label: strings.ListNameFieldLabel,
                  options: this.listOptions,
                  selectedKey: this.properties.listName,
                }),
                PropertyPaneLink("ListUrl", {
                  text: `${strings.GoToTextFieldLabel} ${this.properties.listName} ${strings.ListNameFieldLabel}`,
                  href: getListUrl(
                    true,
                    this.properties.listName,
                    this.context.pageContext.web.absoluteUrl
                  ),
                  target: "_blank",
                }),
                ...categoryControl,
              ],
            },
            ...group,
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
  protected onPropertyPaneFieldChanged(
    propertyPath: string,
    oldValue: any,
    newValue: any
  ): void {
    if (propertyPath == "seeMoreSettingEnable") {
      this.properties.numberOfItems = newValue ? 2 : 0;
      this.properties.seeMoreTextPosition = titlePosition.right;
      this.context.propertyPane.refresh();
    }
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
  private clearFields() {
    this.properties.txtListName = "";
    this.properties.message = "";
  }
  private getTileList() {
    fetchDocumentList(
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
    let api = new TileAPI();
    api.createTeamList(
      this.context.spHttpClient,
      this.context.pageContext.web.absoluteUrl,
      value,
      (data) => {
        this.properties.message = data;
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
                this.onPropertyPaneConfigurationStart();
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
