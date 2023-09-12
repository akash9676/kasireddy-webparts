import {
  PropertyPaneButton,
  PropertyPaneButtonType,
  PropertyPaneLabel,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";

export interface ICreateListSettings {
  txtListName: string;
  message: string;
}

export function createListSettings(
  strings: any,
  buttonClick: (value: any) => any
): any {
  let settings: any[] = [];
  settings.push(
    PropertyPaneTextField("txtListName", {
      label: strings.CreateListNameFieldLabel,
    }),
    PropertyPaneButton("btnCreate", {
      text: strings.CreateButtonNameFieldLabel,
      buttonType: PropertyPaneButtonType.Primary,
      onClick: buttonClick,
    }),
    PropertyPaneLabel("labelField", {
      text: this.properties.message,
    })
  );
  const createListGroup = {
    groupName: strings.CreateListGroupName,
    isCollapsed: true,
    groupFields: [...settings],
  };
  return createListGroup;
}
