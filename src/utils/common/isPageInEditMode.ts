import { Environment, EnvironmentType } from "@microsoft/sp-core-library";

export function isPageInEditMode(): boolean {
  let isInEditMode: boolean;
  //Detect display mode on classic and modern pages pages
  if (Environment.type == EnvironmentType.ClassicSharePoint) {
    let interval: any;
    interval = setInterval(function () {
      if (typeof (window as any).SP.Ribbon !== "undefined") {
        isInEditMode = (
          window as any
        ).SP.Ribbon.PageState.Handlers.isInEditMode();
        clearInterval(interval);
        return isInEditMode;
      }
    }, 100);
  } else if (Environment.type == EnvironmentType.SharePoint) {
    let location: string = document.location.href;
    isInEditMode = location.indexOf("Mode=Edit") !== -1;
    //console.log(isInEditMode, "isInEditMode");
    // this.setState({ isEdit: isInEditMode });
    return isInEditMode;
  }
}
