declare interface INavigationWebPartStrings {
  ListNameFieldLabel: string;
  CategoryFieldLabel: string;
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  CreateListGroupName: string;
  CreateListNameFieldLabel: string;
  CreateButtonNameFieldLabel: string;
  GoToTextFieldLabel: string;
}

declare module "NavigationWebPartStrings" {
  const strings: INavigationWebPartStrings;
  export = strings;
}
