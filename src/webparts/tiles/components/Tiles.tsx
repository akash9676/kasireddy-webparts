import * as React from "react";
import styles from "./Tiles.module.scss";
import { ITilesProps } from "./ITilesProps";
import { ITileItem } from "./ITileItem";
import { SPHttpClient } from "@microsoft/sp-http";
import { ITileState } from "./ITileState";
import * as strings from "TilesWebPartStrings";
import {
  ColumnTypes,
  titlePosition,
  ViewType,
  textPosition,
  ActionType,
} from "./enums";
import { isPageInEditMode } from "../../common/isPageInEditMode";
import { TileAPI } from "../../../api/tileApi";

export default class Tiles extends React.Component<ITilesProps, ITileState> {
  private baseUrl: string;
  private siteTitle: string;
  private spHttpClient: SPHttpClient;
  private api: TileAPI = new TileAPI();

  constructor(props: ITilesProps, state: ITileState) {
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
    this.getTileItems();
  }

  public componentDidUpdate(prevProps) {
    if (
      prevProps.seeMoreSettingEnable !== this.props.seeMoreSettingEnable ||
      prevProps.numberOfItems !== this.props.numberOfItems ||
      prevProps.listName !== this.props.listName ||
      prevProps.category !== this.props.category
    ) {
      this.getTileItems();
    }
  }

  public render(): React.ReactElement<ITilesProps> {
    let tileData = this.state.items;

    return (
      <>
        <div className={`${styles.tiles}`}>
          <h3 className={`${styles.title} ${this.getTitleTextPosition()}`}>
            {this.props.description}
          </h3>
          <div
            className={`${
              styles.tilesContainer
            } ${this.getViewType()} ${this.getColumns()} ${this.getTextPosition()} ${
              this.props.separator ? `${styles.divider}` : ""
            }`}
          >
            {tileData.map((item: ITileItem) => {
              return (
                <a
                  className={styles.tile}
                  {...(item.navigationUrl ? { href: item.navigationUrl } : {})}
                >
                  <div
                    className={styles.img}
                    style={{
                      backgroundImage: `url(${item?.imageUrl})`,
                    }}
                  ></div>
                  <div
                    className={`${styles.details} ${
                      this.props.autoHeight ? `${styles.autoHeight}` : ""
                    }`}
                    style={{
                      backgroundColor: `${
                        this.props.textPosition === textPosition.overlay
                          ? `rgba(255,255,255,${this.props.overlayTransparent})`
                          : ""
                      }`,
                    }}
                  >
                    <h2>{item?.tileTitle}</h2>
                    <div
                      className={`${styles.description} ${
                        styles.lines
                      } ${this.getNumberOfLines()}`}
                    >
                      {item?.tileDescription}
                    </div>
                    {(this.props.textPosition == textPosition.left ||
                      this.props.textPosition == textPosition.right) &&
                      item.navigationUrl && (
                        <a
                          {...(item.navigationUrl
                            ? { href: item.navigationUrl }
                            : {})}
                          className={styles.readmore}
                        >
                          {strings.ReadMoreFieldLabel}
                        </a>
                      )}
                  </div>
                </a>
              );
            })}
            {/* <Pagination itemsPerPage={4} /> */}
          </div>
          {this.props.seeMoreSettingEnable && (
            <a
              href={this.props.seeMoreLinkUrl}
              className={`${styles.seeMore} ${this.getSeeMoreTextPosition()}`}
            >
              {this.props.seeMoreText}
            </a>
          )}
        </div>
      </>
    );
  }
  private getTileItems(): void {
    this.api
      .getTiles(
        this.spHttpClient,
        this.baseUrl,
        this.props.listName,
        this.props.seeMoreSettingEnable ? this.props.numberOfItems : 0,
        this.props.category
      )
      .then((value: ITileItem[]) => {
        if (value.length > 0) {
          this.setState({ items: value });
        } else {
          this.setState({ items: [] });
        }
      });
  }
  private getSeeMoreTextPosition(): string {
    let str: string;
    switch (this.props.seeMoreTextPosition) {
      case titlePosition.left:
        str = styles.left;
        break;
      case titlePosition.center:
        str = styles.center;
        break;
      case titlePosition.right:
        str = styles.right;
        break;
      default:
        str = titlePosition.left;
        break;
    }
    return str;
  }
  private getNumberOfLines(): string {
    let str: string;
    switch (this.props.numberOfLine) {
      case "1":
        str = styles.lines1;
        break;
      case "2":
        str = styles.lines2;
        break;
      case "3":
        str = styles.lines3;
        break;
      case "4":
        str = styles.lines4;
        break;
      case "5":
        str = styles.lines5;
        break;
      default:
        str = styles.lines3;
        break;
    }
    return str;
  }

  private getTitleTextPosition(): string {
    let str: string;
    switch (this.props.titlePosition) {
      case titlePosition.left:
        str = styles.left;
        break;
      case titlePosition.center:
        str = styles.center;
        break;
      case titlePosition.right:
        str = styles.right;
        break;
      default:
        str = titlePosition.left;
        break;
    }
    return str;
  }

  private getViewType(): string {
    let str: string;
    switch (this.props.viewType) {
      case ViewType.square:
        str = styles.square;
        break;
      case ViewType.circle:
        str = styles.circle;
        break;
      default:
        str = styles.square;
        break;
    }
    return str;
  }

  private getTextPosition(): string {
    let str: string;
    switch (this.props.textPosition) {
      case textPosition.left:
        str = styles.left;
        break;
      case textPosition.right:
        str = styles.right;
        break;
      case textPosition.bottom:
        str = styles.bottom;
        break;
      case textPosition.overlay:
        str = styles.overlay;
        break;
      // case textPosition.overlayTransparent:
      //   str = styles.overlayTransparent;
      //   break;
      default:
        str = styles.overlay;
        break;
    }
    return str;
  }

  private getColumns(): string {
    let str: string;
    switch (this.props.columns) {
      case ColumnTypes.columns1:
        str = styles.columns1;
        break;
      case ColumnTypes.columns2:
        str = styles.columns2;
        break;
      case ColumnTypes.columns3:
        str = styles.columns3;
        break;
      case ColumnTypes.columns4:
        str = styles.columns4;
        break;
      default:
        str = styles.columns1;
        break;
    }
    return str;
  }
}
