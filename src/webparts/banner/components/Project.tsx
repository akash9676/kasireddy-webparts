import * as React from "react";
import { IProjectProps } from "./IProjectProps";
import Banner from "../../../utils/banner/components";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";
import { IProjectState } from "./IProjectState";
import * as _ from "lodash";
import { IBannerItem } from "./IBannerItem";
import { BannerAPI } from "../../../api/banner/bannerApi";
import { ActionType } from "../../tiles/components/enums";
import { isPageInEditMode } from "../../../utils/common/isPageInEditMode";

export default class Project extends React.Component<
  IProjectProps,
  IProjectState
> {
  private baseUrl: string;
  private siteTitle: string;
  private spHttpClient: SPHttpClient;
  private httpClient: HttpClient;
  private bannerApi = new BannerAPI();
  private toShowCreateList: ActionType;

  constructor(props: IProjectProps, state: IProjectState) {
    super(props);

    this.siteTitle = props.context.pageContext.web.title;
    this.baseUrl = props.context.pageContext.web.absoluteUrl;
    this.spHttpClient = props.context.spHttpClient;
    this.httpClient = props.context.httpClient;
    this.state = {
      status: "Ready",
      message: "",
      items: [],
      listName: "",
      slideTitle: "",
      slideDescription: "",
      navigationUrl: "",
      fileName: null,
      toShowCreateList: null,
      isEdit: false,
    };
  }

  public componentDidMount(): void {
    let isInEditMode = isPageInEditMode();
    this.setState({ isEdit: isInEditMode });

    this.getBannerImages().then((value: IBannerItem[]) => {
      if (value.length > 0) {
        this.setState({ items: value });
      } else {
        this.setState({ items: [] });
      }
    });
  }
  public componentDidUpdate(prevProps) {
    if (
      prevProps.listName !== this.props.listName ||
      prevProps.category !== this.props.category
    ) {
      this.getBannerImages().then((value: IBannerItem[]) => {
        if (value.length > 0) {
          this.setState({ items: value });
        } else {
          this.setState({ items: [] });
        }
      });
    }
  }
  public render(): React.ReactElement<IProjectProps> {
    return (
      <>
        <Banner
          bannerText={this.siteTitle}
          bannerItems={this.state.items}
          textPosition={this.props.textPosition}
          speed={this.props.speed}
          textSize={this.props.textSize}
          height={this.props.height}
          arrows={this.props.arrows}
          autoPlay={this.props.autoPlay}
          dots={this.props.dots}
          slideView={this.props.slideView}
          slideDetailPosition={this.props.slideDetailPosition}
          slideTitleFromList={this.props.slideTitleFromList}
          arrowsOnHover={this.props.arrowsOnMouseOver}
          position={this.props.bannerImagePosition}
        />
      </>
    );
  }

  private async getBannerImages(): Promise<IBannerItem[]> {
    return await this.bannerApi.getBannerImages(
      this.spHttpClient,
      this.baseUrl,
      this.props.listName,
      this.props.category
    );
  }
}
