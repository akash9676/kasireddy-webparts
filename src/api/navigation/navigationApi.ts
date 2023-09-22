import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
  HttpClient,
} from "@microsoft/sp-http";
import { INavigationItem } from "../../webparts/navigation/components/INavigationItem";
import * as _ from "lodash";
import { forEach } from "lodash";
import getFormDigest from "../getFormDigest";
import { Utility } from "../utility";

export class NavigationAPI {
  public async getNavigationItms(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    categoryName: string
  ): Promise<INavigationItem[]> {
    let items: INavigationItem[] = [];
    const categoryFilter: string =
      categoryName === undefined || categoryName === "All"
        ? ""
        : `&$filter=Category eq '${categoryName}'`;
    const bannerEnpointUrl: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/items?$select=Id,Title,Description,Parent,NavigationUrl,Category${categoryFilter}`;
    const response: SPHttpClientResponse = await spHttpClient.get(
      bannerEnpointUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: "application/json;odata=nometadata",
          "odata-version": "",
        },
      }
    );
    const responseJson: any = await response.json();
    if (
      responseJson != undefined &&
      responseJson.value != undefined &&
      responseJson.value.length > 0
    ) {
      responseJson.value.map((val: any, i) => {
        if (val.Parent == 0) {
          items.push({
            id: val.Id,
            name: val.Title,
            description: val.Description,
            parentid: val.Parent,
            children: [],
            navigationUrl: val.NavigationUrl
              ? Utility.IsUrlAbsolute(val.NavigationUrl)
                ? val.NavigationUrl
                : baseUrl + val.NavigationUrl
              : "",
          });
        } else {
          var parentObject = _.find(items, ["id", val.Parent]);
          if (parentObject) {
            parentObject.children.push({
              id: val.Id0,
              name: val.Title,
              description: val.Description,
              parentid: val.Parent,
              children: [],
              navigationUrl: val.NavigationUrl
                ? baseUrl + val.NavigationUrl
                : "",
            });
          }
        }
      });
    }
    return items;
  }

  public async isNavigationListExists(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string
  ): Promise<boolean> {
    const bannerEnpointUrl: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/items?$select=Title&&$filter=title eq '${listName}'`;
    const response: SPHttpClientResponse = await spHttpClient.get(
      bannerEnpointUrl,
      SPHttpClient.configurations.v1,
      {
        headers: {
          Accept: "application/json;odata=nometadata",
          "odata-version": "",
        },
      }
    );
    if (response.status === 404) {
      return false;
    }
    return true;
  }

  public async createNavigationList(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    successFunction: (data: any) => void,
    failureFunction: (data: any) => void
  ): Promise<void> {
    const listEndPointUrl: string = `${baseUrl}/_api/web/lists`;
    const listColumnEndPointUrl: string = `${baseUrl}/_api/web/lists/getByTitle('${listName}')`;
    const listDefinition: any = {
      __metadata: {
        type: "SP.List",
      },
      Title: listName,
      Description: `${listName} description`,
      AllowContentTypes: true,
      BaseTemplate: 100,
      // ContentTypesEnabled: true,
    };

    const columnDefinations: any = [
      {
        Title: "Id",
        InternalName: "Id",
        FieldTypeKind: 1,
      },
    ];

    getFormDigest(baseUrl, spHttpClient).then(async (data: any) => {
      let value = await data.json();
      const spOpts: ISPHttpClientOptions = {
        headers: {
          Accept: "application/json;odata=nometadata",
          "Content-type": "application/json;odata=verbose",
          "X-RequestDigest": value.FormDigestValue,
          "odata-version": "",
        },
        body: JSON.stringify(listDefinition),
      };
      spHttpClient
        .post(listEndPointUrl, SPHttpClient.configurations.v1, spOpts)
        .then(
          async (response) => {
            if (response.status === 500) {
              failureFunction("List already exists");
            }
            if (response.status === 201) {
              successFunction("List created successfully");
            }
          },
          (error) => {
            failureFunction("List already exists");
          }
        );
    });
  }

  public async addColumns(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    successFunction: (data: any) => void
  ): Promise<void> {
    let url: string =
      baseUrl + `/_api/web/lists/getByTitle('${listName}')/fields`;
    const columnDefinations: any = [
      {
        Title: "Id",
        FieldTypeKind: 1,
      },
      {
        Title: "Parent",
        FieldTypeKind: 1,
      },
      {
        Title: "Description",
        FieldTypeKind: 2,
      },
      {
        Title: "NavigationUrl",
        FieldTypeKind: 2,
      },
    ];
    // forEach(columnDefinations, function (value, key) {
    const spOpts1: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "odata-version": "",
      },
      body: "{'__metadata':{'type': 'SP.FieldNumber'},'FieldTypeKind': 9,'Title':'Id'}",
      method: "POST",
    };
    spHttpClient
      .post(url, SPHttpClient.configurations.v1, spOpts1)
      .then(async (resut) => {
        let data = await resut.json();
        const spOpts2: ISPHttpClientOptions = {
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "odata-version": "",
          },
          body: "{'__metadata':{'type': 'SP.FieldNumber'},'FieldTypeKind': 9,'Title':'Parent'}",
          method: "POST",
        };
        spHttpClient
          .post(url, SPHttpClient.configurations.v1, spOpts2)
          .then(async (resut) => {
            let data = await resut.json();
            const spOpts3: ISPHttpClientOptions = {
              headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "odata-version": "",
              },
              body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Description'}",
              method: "POST",
            };
            spHttpClient
              .post(url, SPHttpClient.configurations.v1, spOpts3)
              .then(async (resut) => {
                let data = await resut.json();
                const spOpts4: ISPHttpClientOptions = {
                  headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "odata-version": "",
                  },
                  body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'NavigationUrl'}",
                  method: "POST",
                };
                spHttpClient
                  .post(url, SPHttpClient.configurations.v1, spOpts4)
                  .then(async (resut) => {
                    let data = await resut.json();
                    const spOpts5: ISPHttpClientOptions = {
                      headers: {
                        Accept: "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "odata-version": "",
                      },
                      body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Category'}",
                      method: "POST",
                    };
                    spHttpClient
                      .post(url, SPHttpClient.configurations.v1, spOpts5)
                      .then(async (resut) => {
                        let data = await resut.json();
                        this.addView(
                          spHttpClient,
                          baseUrl,
                          listName,
                          successFunction
                        );
                      });
                  });
              });
          });
      });
    // });
  }

  public async addItems(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    items: INavigationItem,
    successFunction: (data: any) => void,
    failureFunction: (data: any) => void
  ): Promise<void> {
    let url = `${baseUrl}/_api/web/lists/getbytitle('${listName}')/items`;

    const spOpts: ISPHttpClientOptions = {
      body: `{ Id:'${items.id}',Title:'${items.name}',Description:'${items.description}',Parent:'${items.parentid}',NavigationUrl:'${items.navigationUrl}' }`,
    };

    spHttpClient.post(url, SPHttpClient.configurations.v1, spOpts).then(
      async (response: SPHttpClientResponse) => {
        let result = await response.json();
        successFunction(result);
      },
      (error: any): void => {
        failureFunction(error);
      }
    );
  }

  public addView(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    successFunction: (data: any) => void
  ) {
    const url: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/Views/GetByTitle('All%20Items')/ViewFields/`;
    const spOpts1: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "odata-version": "",
      },
      body: "",
      method: "POST",
    };
    spHttpClient
      .post(`${url}addViewField('Id')`, SPHttpClient.configurations.v1, spOpts1)
      .then(async (result) => {
        spHttpClient
          .post(
            `${url}addViewField('Parent')`,
            SPHttpClient.configurations.v1,
            spOpts1
          )
          .then(async (resut) => {
            let data = await resut.json();
            spHttpClient
              .post(
                `${url}addViewField('Description')`,
                SPHttpClient.configurations.v1,
                spOpts1
              )
              .then(async (resut) => {
                let data = await resut.json();
                spHttpClient
                  .post(
                    `${url}addViewField('NavigationUrl')`,
                    SPHttpClient.configurations.v1,
                    spOpts1
                  )
                  .then(async (resut) => {
                    let data = await resut.json();
                    spHttpClient
                      .post(
                        `${url}addViewField('Category')`,
                        SPHttpClient.configurations.v1,
                        spOpts1
                      )
                      .then(async (resut) => {
                        let data = await resut.json();
                        successFunction("View Added");
                      });
                  });
              });
          });
      });
  }
  public async addItemInList(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    items: any,
    successFunction: (data: any) => void,
    failureFunction: (data: any) => void
  ): Promise<void> {
    const listUrl: string = `${baseUrl}/_api/web/lists/getByTitle('${listName}')/items`;

    const listItem: any = {
      Title: items.Title,
      Id: Number(items.Id),
      Parent: Number(items.Parent),
      Description: items.Description,
      NavigationUrl: items.NavigationUrl,
      Category: items.Category,
    };
    const spOpts: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-type": "application/json;odata=nometadata",
        "odata-version": "",
        "X-HTTP-Method": "POST",
      },
      body: JSON.stringify(listItem),
    };
    await spHttpClient
      .post(listUrl, SPHttpClient.configurations.v1, spOpts)
      .then(
        async (response: SPHttpClientResponse) => {
          let result = await response.json();
          console.log(result);
          if (
            response.status === 200 ||
            response.status === 201 ||
            response.status === 204
          ) {
            successFunction("Item Saved Successfully");
          }
        },
        (error: any): void => {
          console.log(error);
          failureFunction("Not Saved");
        }
      );
  }
  public addSampleData(
    value: string,
    baseUrl: string,
    spHttpClient: SPHttpClient,
    successFunction: (data: any) => void,
    failureFunction: (data: any) => void
  ) {
    this.addItemInList(
      spHttpClient,
      baseUrl,
      value,
      {
        Title: "Sample Title 1",
        Id: 1,
        Parent: 0,
        Description: "Description 1",
        NavigationUrl: "",
        Category: "Sample",
      },
      (data) => {
        this.addItemInList(
          spHttpClient,
          baseUrl,
          value,
          {
            Title: "Sample Title 2",
            Id: 2,
            Parent: 0,
            Description: "Description 2",
            NavigationUrl: "",
            Category: "Sample",
          },
          (data) => {
            this.addItemInList(
              spHttpClient,
              baseUrl,
              value,
              {
                Title: "Sample Title 3",
                Id: 3,
                Parent: 1,
                Description: "Description 3",
                NavigationUrl: "",
                Category: "Sample",
              },
              (data) => {
                successFunction("Sample Data Added");
              },
              (error) => {
                failureFunction(error);
              }
            );
          },
          (error) => {
            failureFunction(error);
          }
        );
      },
      (error) => {
        failureFunction(error);
      }
    );
  }
}
