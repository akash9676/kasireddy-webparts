import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneLink,
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneLabel,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "ProjectWebPartStrings";
import Project from "./components/Project";
import { IProjectProps } from "./components/IProjectProps";
import { fetchDocumentList } from "../../api/fetchDocumentList";
import { fetchListCategory } from "../../api/fetchListCategory";
import { getListUrl } from "../common/getListUrl";
import { BannerAPI } from "../../api/banner/bannerApi";
import { Constant } from "./constant";

export interface IProjectWebPartProps {
  listName: string;
  textPosition: string;
  bannerImagePosition: string;
  // textSize: string;
  textSize: number;
  speed: number;
  height: number;
  dots: boolean;
  arrows: boolean;
  autoPlay: boolean;
  slideView: string;
  slideDetailPosition: string;
  slideTitleFromList: string;
  arrowsOnMouseOver: boolean;
  listOptions: any;
  category: string;
  txtListName: string;
  message: string;
}

export default class ProjectWebPart extends BaseClientSideWebPart<IProjectWebPartProps> {
  private listsFetched: boolean;
  //vars to hold a list of lists and a list of columns for a given list
  private listOptions: IPropertyPaneDropdownOption[];
  private listCategoryOptions: IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<IProjectProps> = React.createElement(
      Project,
      {
        context: this.context,
        listName: this.properties.listName,
        textPosition: this.properties.textPosition,
        bannerImagePosition: this.properties.bannerImagePosition,
        speed: this.properties.speed,
        textSize: this.properties.textSize,
        height: this.properties.height,
        dots: this.properties.dots,
        arrows: this.properties.arrows,
        autoPlay: this.properties.autoPlay,
        slideView: this.properties.slideView,
        slideDetailPosition: this.properties.slideDetailPosition,
        slideTitleFromList: this.properties.slideTitleFromList,
        arrowsOnMouseOver: this.properties.arrowsOnMouseOver,
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
    this.getBannerList();
    this.properties.bannerImagePosition = "center";
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
      //this.properties.category = "All";
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
    let slidewithDetailControls: any = [];
    let basicControl: any = [];
    let categoryControl: any[] = [];
    let group: any[] = [];
    if (this.properties.slideView === "slidewithDetail") {
      slidewithDetailControls = [
        PropertyPaneDropdown("slideDetailPosition", {
          label: strings.slideDetailPositionFieldLable,
          options: [
            {
              key: Constant.LEFT,
              text: "Left",
            },
            {
              key: Constant.RIGHT,
              text: "Right",
            },
          ],
        }),
      ];
    } else {
      basicControl = [
        PropertyPaneToggle(Constant.SLIDE_TITLE_FROM_LIST, {
          key: Constant.SLIDE_TITLE_FROM_LIST,
          label: strings.slideTitleFromListFieldLabel,
          onText: strings.displayFromListFieldLabel,
          offText: strings.noDisplayFromListFieldLabel,
        }),
        PropertyPaneDropdown("textPosition", {
          label: strings.TextPositionFieldLabel,
          options: [
            {
              key: Constant.BOTTOM_LEFT,
              text: strings.bottomLeftFieldLabel,
            },
            {
              key: Constant.TOP_LEFT,
              text: strings.topLeftFieldLabel,
            },
            {
              key: Constant.TOP_RIGHT,
              text: strings.topRightFieldLabel,
            },
            {
              key: Constant.BOTTOM_RIGHT,
              text: strings.bottomRightFieldLabel,
            },
          ],
        }),
        PropertyPaneDropdown("bannerImagePosition", {
          label: strings.ImagePositionFieldLabel,
          options: [
            {
              key: Constant.CENTER,
              text: strings.centerImagePosFieldLable,
            },
            {
              key: Constant.TOP_LEFT,
              text: strings.topLeftImagePosFieldLable,
            },
            {
              key: Constant.TOP_CENTER,
              text: strings.topCenterImagePosFieldLable,
            },
            {
              key: Constant.TOP_RIGHT,
              text: strings.topRightImagePosFieldLable,
            },
            {
              key: Constant.RIGHT_CENTER,
              text: strings.rightCenterImagePosFieldLable,
            },
            {
              key: Constant.BOTTOM_RIGHT,
              text: strings.bottomRightImagePosFieldLable,
            },
            {
              key: Constant.BOTTOM_CENTER,
              text: strings.bottomCenterImagePosFieldLable,
            },
            {
              key: Constant.BOTTOM_LEFT,
              text: strings.bottomLeftImagePosFieldLable,
            },
            {
              key: Constant.LEFT_CENTER,
              text: strings.leftCenterImagePosFieldLable,
            },
          ],
        }),
        // PropertyPaneDropdown("textSize", {
        //   label: strings.TextSizeFieldLabel,
        //   options: [
        //     {
        //       key: Constant.PX_46,
        //       text: "46 px",
        //     },
        //     {
        //       key: Constant.PX_38,
        //       text: "38 px",
        //     },
        //     {
        //       key: Constant.PX_32,
        //       text: "32 px",
        //     },
        //     {
        //       key: Constant.PX_26,
        //       text: "26 px",
        //     },
        //   ],
        // }),

        PropertyPaneSlider("textSize", {
          label: "Text Size",
          min: 12, // Minimum text size
          max: 60, // Maximum text size
          step: 1, // Step increment
          showValue: true, // Show the current value next to the slider
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
            PropertyPaneDropdown("slideView", {
              label: strings.slideViewFieldLabel,
              options: [
                {
                  key: Constant.BASIC,
                  text: strings.slideViewBasicFieldLabel,
                },
                {
                  key: Constant.BASIC_WITH_DETAIL,
                  text: strings.slideViewBasicDetailFieldLabel,
                },
                {
                  key: Constant.SLIDE_WITH_DETAIL,
                  text: strings.slideViewDetailFieldLabel,
                },
              ],
            }),
            ...slidewithDetailControls,
            ...basicControl,
            PropertyPaneSlider("height", {
              label: strings.HeightFieldLable,
              min: 150,
              max: 1000,
              showValue: true,
              step: 5,
            }),
            PropertyPaneTextField("speed", {
              label: strings.SpeedFieldLabel,
            }),
            PropertyPaneToggle("dots", {
              key: Constant.DOTS,
              label: strings.DotsFieldLabel,
              onText: strings.dispalyFieldLabel,
              offText: strings.noDisplayFieldLabel,
            }),
            PropertyPaneToggle("arrows", {
              key: Constant.ARROWS,
              label: strings.ArrowsFiledLabel,
              onText: strings.dispalyFieldLabel,
              offText: strings.noDisplayFieldLabel,
            }),
            PropertyPaneToggle("arrowsOnMouseOver", {
              key: Constant.ARROWS_ON_MOUSE_OVER,
              label: strings.arrowsOnMouseOverFieldLabel,
              onText: strings.enableFieldLabel,
              offText: strings.noEnableFieldLabel,
            }),
            PropertyPaneToggle("autoPlay", {
              key: Constant.AUTO_PLAY,
              label: strings.AutoPlayFieldLabel,
              onText: strings.enableFieldLabel,
              offText: strings.noEnableFieldLabel,
            }),
          ],
        },
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
  private clearFields() {
    this.properties.txtListName = "";
    this.properties.message = "";
  }
  private getBannerList() {
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
    let api = new BannerAPI();
    api.createBannerList(
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
                this.getBannerList();
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
