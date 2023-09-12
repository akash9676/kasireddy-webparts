import * as React from "react";
import { ITeamProps } from "./ITeamProps";
import Teams from "../../../utils/teams/components";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { ITeam, ITeamState } from "./ITeamState";
import * as _ from "lodash";
import { ISeeMoreSettings } from "../../../settings/seeMoreSettings/ISeeMoreSettings";
import { isPageInEditMode } from "../../common/isPageInEditMode";
import { TeamAPI } from "../../../api/teamApi";
import CreateList from "../../common/components/createlist/CreateList";
import { ISPHttpClientOptions, HttpClient } from "@microsoft/sp-http";

export default class Team extends React.Component<ITeamProps, ITeamState> {
  private baseUrl: string;
  private siteTitle: string;
  private spHttpClient: SPHttpClient;
  private api: TeamAPI = new TeamAPI();

  constructor(props: ITeamProps, state: ITeamState) {
    super(props);

    this.siteTitle = props.context.pageContext.web.title;
    this.baseUrl = props.context.pageContext.web.absoluteUrl;
    this.spHttpClient = props.context.spHttpClient;
    this.state = {
      status: "Ready",
      items: [],
      isEdit: false,
      toShowCreateList: null,
      message: "",
      listName: "",
    };
  }

  public componentDidMount(): void {
    let isInEditMode = isPageInEditMode();
    this.setState({ isEdit: isInEditMode });
    this.getTeamItem();
  }

  public componentDidUpdate(prevProps) {
    if (
      prevProps.seeMoreSettingEnable !== this.props.seeMoreSettingEnable ||
      prevProps.numberOfItems !== this.props.numberOfItems ||
      prevProps.listName !== this.props.listName ||
      prevProps.category !== this.props.category
    ) {
      this.getTeamItem();
    }
  }

  public render(): React.ReactElement<ITeamProps> {
    const seeMoreSetting: ISeeMoreSettings = {
      seeMoreSettingEnable: this.props.seeMoreSettingEnable,
      seeMoreText: this.props.seeMoreText,
      numberOfItems: this.props.numberOfItems,
      seeMoreLinkUrl: this.props.seeMoreLinkUrl,
      seeMoreTextPosition: this.props.seeMoreTextPosition,
    };
    return (
      <>
        <Teams
          title={this.props.description}
          teams={this.state.items}
          titlePosition={this.props.titlePosition}
          columns={this.props.columns}
          roundedCorner={this.props.roundedCorner}
          roundedCornerPx={this.props.roundedCornerPx}
          isRegionDisplay={this.props.isRegionDisplay}
          viewType={this.props.viewType}
          speed={this.props.speed}
          arrows={this.props.arrows}
          autoPlay={this.props.autoPlay}
          dots={this.props.dots}
          slideToScroll={this.props.slideToScroll}
          slideToShow={this.props.slideToShow}
          arrowsOnHover={this.props.arrowsOnMouseOver}
          seeMoreSettings={seeMoreSetting}
        />
      </>
    );
  }

  private getTeamItem(): void {
    this.api
      .getTeam(
        this.spHttpClient,
        this.baseUrl,
        this.props.listName,
        this.props.seeMoreSettingEnable ? this.props.numberOfItems : 0,
        this.props.category
      )
      .then((value: ITeam[]) => {
        if (value.length > 0) {
          this.setState({ items: value });
        } else {
          this.setState({ items: [] });
        }
      });
    // let r = this.dataURItoBlob(this.defaultProfilePic);
    // let obj = new File(r, "image1.png");
    // let spOpts: ISPHttpClientOptions = {
    //   headers: {
    //     Accept: "image/png",
    //     "Content-Type": "image/png",
    //   },
    //   body: obj,
    // };

    // var url = `https://iktecio.sharepoint.com/sites/DCP02/_api/Web/Lists/getByTitle('banner')/RootFolder/Files/Add(url='image1.png', overwrite=true)`;

    // this.spHttpClient
    //   .post(url, SPHttpClient.configurations.v1, spOpts)
    //   .then((response: SPHttpClientResponse) => {
    //     if (response.status === 200) {
    //       response.json().then((responseJSON: JSON) => {
    //         console.log(responseJSON);
    //       });
    //     }
    //   });
  }
  private dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    // var bb = new Blob([ab], { type: "image/png" });
    return [ab];
  }
}
