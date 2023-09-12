import {
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle,
} from "@microsoft/sp-property-pane";
import { Constant } from "./Constant";

export function getSeeMoreSettings(
  isSeeMoreEnable: boolean,
  strings: any
): any[] {
  let seeMoreSetting: any[] = [];

  if (isSeeMoreEnable) {
    seeMoreSetting.push(
      PropertyPaneTextField("seeMoreText", {
        label: strings.SeeMoreTextFieldLable,
      }),
      PropertyPaneTextField("seeMoreLinkUrl", {
        label: strings.SeeMoreLinkUrlFieldLable,
        // onGetErrorMessage: this.validateDescription.bind(this),
      }),
      PropertyPaneDropdown("seeMoreTextPosition", {
        label: strings.TitlePositionFieldLabel,
        options: [
          {
            key: Constant.LEFT,
            text: strings.LeftFieldLabel,
          },
          {
            key: Constant.CENTER,
            text: strings.CenterFieldLabel,
          },
          {
            key: Constant.RIGHT,
            text: strings.RightFieldLabel,
          },
        ],
      }),
      PropertyPaneSlider("numberOfItems", {
        label: strings.NoOfItemsFieldLable,
        min: 2,
        max: 50,
        showValue: true,
        step: 1,
      })
    );
  }
  return seeMoreSetting;
}

function validateDescription(value: string): string {
  if (value === null || value.trim().length === 0) {
    return "Provide a see more link url";
  }
  return "";
}

export function SeeMoreGroupSettings(strings: any, properties: any) {
  return {
    groupName: strings.SeeMoreSettingGroupName,
    isCollapsed: true,
    groupFields: [
      PropertyPaneToggle("seeMoreSettingEnable", {
        key: Constant.SEE_MORE_SETTING_ENABLE,
        label: strings.SeeMoreSettingEnableTextFieldLable,
        onText: strings.EnableSeeMoreTextFieldLable,
        offText: strings.NoSeeMoreTextFieldLable,
      }),
      ...getSeeMoreSettings(properties.seeMoreSettingEnable, strings),
    ],
  };
}

export function getSeeMoreProp(properties) {
  return {
    seeMoreSettingEnable: properties.seeMoreSettingEnable,
    seeMoreText: properties.seeMoreText,
    numberOfItems: properties.numberOfItems,
    seeMoreLinkUrl: properties.seeMoreLinkUrl,
    seeMoreTextPosition: properties.seeMoreTextPosition,
  };
}
