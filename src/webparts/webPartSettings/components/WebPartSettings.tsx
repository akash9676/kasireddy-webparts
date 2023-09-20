// import * as React from "react";
// import styles from "./WebPartSettings.module.scss";
// import { IWebPartSettingsProps } from "./IWebPartSettingsProps";
// import { escape } from "@microsoft/sp-lodash-subset";

// export default class WebPartSettings extends React.Component<
//   IWebPartSettingsProps,
//   {}
// > {
//   public render(): React.ReactElement<IWebPartSettingsProps> {
//     const {
//       description,
//       isDarkTheme,
//       environmentMessage,
//       hasTeamsContext,
//       userDisplayName,
//     } = this.props;

//     return <div></div>;
//   }
// }

import * as React from "react";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { IWebPartSettingsProps } from "./IWebPartSettingsProps";
// import { BannerComponent } from "path-to-BannerWebPart";
// import  Project  from "../../project/components/Project";
// import { Navigation } from "../../navigation/components/Navigation";
import Banner from "../../../utils/banner/components/index";

export default class WebPartSettings extends BaseClientSideWebPart<IWebPartSettingsProps> {
  public render(): void {
    // Determine which web part was selected
    const selectedWebPart = this.properties.webPartSelect;

    // Initialize the web part content
    let webPartContent = null;

    // Check the selected web part
    if (selectedWebPart === "Banner") {
      // Render BannerComponent from the imported module
      webPartContent = <Banner />;
    } else if (selectedWebPart === "Tile") {
      // Handle other web part imports similarly
    }

    // Render the selected web part content
    this.domElement.innerHTML = `
      <div>
        ${webPartContent}
      </div>
    `;
  }

  // Other code for your NewWebPartWebPart
}
