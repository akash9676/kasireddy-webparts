import * as React from "react";
import styles from "./Navigation.module.scss";
import { INavigationProps } from "./INavigationProps";
import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { INavigationItem } from "./INavigationItem";
import * as _ from "lodash";
import { INavigationState } from "./INavigationState";
import { NavigationAPI } from "../../../api/navigationApi";
import { isPageInEditMode } from "../../common/isPageInEditMode";

export default class Navigation extends React.Component<
  INavigationProps,
  INavigationState
> {
  private baseUrl: string;
  private siteTitle: string;
  private spHttpClient: SPHttpClient;
  private api: NavigationAPI = new NavigationAPI();
  private pageContext: any;

  constructor(props: INavigationProps, state: INavigationState) {
    super(props);

    this.siteTitle = props.context.pageContext.web.title;
    this.baseUrl = props.context.pageContext.web.absoluteUrl;
    this.spHttpClient = props.context.spHttpClient;
    this.state = {
      status: "Ready",
      items: [],
      listName: "",
      message: "",
      id: 0,
      parent: 0,
      title: "",
      description: "",
      navigationUrl: "",
      isEdit: false,
      toShowCreateList: null,
    };
  }

  public componentDidMount(): void {
    let isInEditMode = isPageInEditMode();
    this.setState({ isEdit: isInEditMode });

    this.getNavigationItems();
  }

  public componentDidUpdate(prevProps) {
    if (
      prevProps.listName !== this.props.listName ||
      prevProps.category !== this.props.category
    ) {
      this.getNavigationItems();
    }
  }

  public render(): React.ReactElement<INavigationProps> {
    const navItems = this.state.items;
    return (
      <>
        <div className={styles.navigation}>
          {navItems?.map((item: INavigationItem) => {
            return (
              <ul>
                <li>
                  {item?.name}
                  {item?.children.length > 0 && (
                    <ul>
                      {item?.children?.map((subItem: INavigationItem) => {
                        return (
                          <li>
                            <a href={subItem?.navigationUrl}>{subItem?.name}</a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              </ul>
            );
          })}
        </div>
      </>
    );
  }

  private getNavigationItems(): void {
    this.api
      .getNavigationItms(
        this.spHttpClient,
        this.baseUrl,
        this.props.listName,
        this.props.category
      )
      .then((value: INavigationItem[]) => {
        if (value.length > 0) {
          this.setState({ items: value });
        } else {
          this.setState({ items: [] });
        }
      });
  }

  private addItemInList(): void {
    let api = new NavigationAPI();
    let item: INavigationItem = {
      id: this.state.id,
      description: this.state.description,
      parentid: this.state.parent,
      name: this.state.title,
      navigationUrl: this.state.navigationUrl,
    };
    api.addItems(
      this.spHttpClient,
      this.baseUrl,
      this.state.listName,
      item,
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
