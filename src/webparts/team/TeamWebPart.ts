import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  IPropertyPaneDropdownOption,
  PropertyPaneLink,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneLabel,
  PropertyPaneSlider,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "TeamWebPartStrings";
import Team from "./components/Team";
import { ITeamProps } from "./components/ITeamProps";
import * as _ from "lodash";
import { ISeeMoreSettings } from "../../settings/seeMoreSettings/ISeeMoreSettings";
import {
  getSeeMoreProp,
  SeeMoreGroupSettings,
} from "../../settings/seeMoreSettings/SeeMoreSettings";
import { titlePosition } from "../tiles/components/enums";
import { fetchList } from "../../api/fetchList";
import { fetchListCategory } from "../../api/fetchListCategory";
import { getListUrl } from "../../utils/common/getListUrl";
import { TeamAPI } from "../../api/team/teamApi";

export interface ITeamWebPartProps extends ISeeMoreSettings {
  listName: string;
  description: string;
  titlePosition: string;
  columns: string;
  roundedCorner: boolean;
  isRegionDisplay: boolean;
  viewType: string;
  speed: number;
  dots: boolean;
  arrows: boolean;
  autoPlay: boolean;
  slideToScroll: number;
  slideToShow: number;
  arrowsOnMouseOver: boolean;
  category: string;
  txtListName: string;
  message: string;
  roundedCornerPx: string;
}

export default class TeamWebPart extends BaseClientSideWebPart<ITeamWebPartProps> {
  private ddlOption: any = [
    {
      key: 1,
      text: "1",
    },
    {
      key: 2,
      text: "2",
    },
    {
      key: 3,
      text: "3",
    },
    {
      key: 4,
      text: "4",
    },
    {
      key: 5,
      text: "5",
    },
    {
      key: 6,
      text: "6",
    },
  ];
  private ddlSlideToScrollOption: any = [
    {
      key: 1,
      text: "1",
    },
  ];
  //vars to hold a list of lists and a list of columns for a given list
  private listOptions: IPropertyPaneDropdownOption[];
  private listCategoryOptions: IPropertyPaneDropdownOption[];

  public render(): void {
    const webPartProp = {
      context: this.context,
      description: this.properties.description,
      listName: this.properties.listName,
      titlePosition: this.properties.titlePosition,
      columns: this.properties.columns,
      roundedCorner: this.properties.roundedCorner,
      isRegionDisplay: this.properties.isRegionDisplay,
      viewType: this.properties.viewType,
      speed: this.properties.speed,
      dots: this.properties.dots,
      arrows: this.properties.arrows,
      autoPlay: this.properties.autoPlay,
      slideToScroll: this.properties.slideToScroll,
      slideToShow: this.properties.slideToShow,
      arrowsOnMouseOver: this.properties.arrowsOnMouseOver,
      category: this.properties.category,
      roundedCornerPx: this.properties.roundedCornerPx,
    };

    const element: React.ReactElement<ITeamProps> = React.createElement(Team, {
      ...webPartProp,
      ...getSeeMoreProp(this.properties),
    });

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
      // this.properties.category = lists[0].text;
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
    this.getTeamList();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    let slideControls: any = [];
    let basicControl: any = [];
    let groups: any[] = [];
    let categoryControl: any[] = [];
    let roundedCornerPxControl: any[] = [];
    if (this.properties.viewType === "slide") {
      slideControls = [
        PropertyPaneTextField("speed", {
          label: strings.SpeedFieldLabel,
        }),
        PropertyPaneToggle("dots", {
          key: "dots",
          label: strings.DotsFieldLabel,
          onText: strings.dispalyFieldLabel,
          offText: strings.noDisplayFieldLabel,
        }),
        PropertyPaneToggle("arrows", {
          key: "arrows",
          label: strings.ArrowsFiledLabel,
          onText: strings.dispalyFieldLabel,
          offText: strings.noDisplayFieldLabel,
        }),
        PropertyPaneToggle("arrowsOnMouseOver", {
          key: "arrowsOnMouseOver",
          label: strings.arrowsOnMouseOverFieldLabel,
          onText: strings.enableFieldLabel,
          offText: strings.noEnableFieldLabel,
        }),
        PropertyPaneToggle("autoPlay", {
          key: "autoPlay",
          label: strings.AutoPlayFieldLabel,
          onText: strings.enableFieldLabel,
          offText: strings.noEnableFieldLabel,
        }),
        PropertyPaneDropdown("slideToShow", {
          label: strings.slideToShowFiledLabel,
          options: [
            {
              key: 1,
              text: "1",
            },
            {
              key: 2,
              text: "2",
            },
            {
              key: 3,
              text: "3",
            },
            {
              key: 4,
              text: "4",
            },
            {
              key: 5,
              text: "5",
            },
            {
              key: 6,
              text: "6",
            },
          ],
        }),
        PropertyPaneDropdown("slideToScroll", {
          label: strings.slideToScrollFieldLabel,
          options: this.ddlSlideToScrollOption,
        }),
      ];
    } else {
      basicControl = [
        PropertyPaneDropdown("columns", {
          label: strings.ColumnsFieldLabel,
          options: [
            {
              key: "1",
              text: "1",
            },
            {
              key: "2",
              text: "2",
            },
            {
              key: "3",
              text: "3",
            },
            {
              key: "4",
              text: "4",
            },
            {
              key: "5",
              text: "5",
            },
            {
              key: "6",
              text: "6",
            },
          ],
          selectedKey: this.properties.columns,
        }),
      ];
    }
    if (this.properties.roundedCorner) {
      roundedCornerPxControl = [
        PropertyPaneSlider("roundedCornerPx", {
          label: "Rounder corner in px",
          min: 4,
          max: 20,
          showValue: true,
          step: 2,
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
      groups = [
        {
          groupName: strings.AdvancedGroupName,
          isCollapsed: true,
          groupFields: [
            PropertyPaneDropdown("viewType", {
              label: strings.ViewTypeFieldLabel,
              options: [
                {
                  key: "slide",
                  text: strings.viewTypeSliderFieldLabel,
                },
                {
                  key: "basic",
                  text: strings.viewTypeBasicFieldLabel,
                },
                {
                  key: "block",
                  text: strings.viewTypeBlockFieldLabel,
                },
              ],
            }),
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
            ...slideControls,
            ...basicControl,
            PropertyPaneToggle("roundedCorner", {
              key: "roundedCorner",
              label: strings.RoundedCorner,
              onText: strings.roundCornerFieldLabel,
              offText: strings.noRoundCornerFieldLabel,
            }),
            ...roundedCornerPxControl,
            PropertyPaneToggle("isRegionDisplay", {
              key: "isRegionDisplay",
              label: strings.isRegionDisplayLabel,
              onText: strings.roundCornerFieldLabel,
              offText: strings.noRoundCornerFieldLabel,
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
              isCollapsed: false,
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
                    false,
                    this.properties.listName,
                    this.context.pageContext.web.absoluteUrl
                  ),
                  target: "_blank",
                }),
                ...categoryControl,
              ],
            },
            ...groups,
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
    if (propertyPath == "slideToShow") {
      this.ddlSlideToScrollOption = _.filter(this.ddlOption, function (l) {
        return l.key <= newValue;
      });
      this.context.propertyPane.refresh();
    }
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
  private getTeamList() {
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
    let api = new TeamAPI();
    api.createTeamList(
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
                this.getTeamList();
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
