import { ITeam } from "../../webparts/team/components/ITeamState";
import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
  HttpClient,
} from "@microsoft/sp-http";
import getFormDigest from "../getFormDigest";
import { SampleImages } from "../../utils/sample/SampleImages";

export class TeamAPI {
  public async getTeam(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    numberOfItems: number,
    categoryName: string
  ): Promise<ITeam[]> {
    let teams: ITeam[] = [];
    const topOperator =
      numberOfItems !== undefined && numberOfItems > 0
        ? `$top=${numberOfItems} & `
        : "";
    const categoryFilter: string =
      categoryName === undefined || categoryName === "All"
        ? ""
        : `&$filter=Category eq '${categoryName}'`;
    const enpointUrl: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/items?${topOperator}$select=Name,Email,Department,ProfilePic,Region${categoryFilter}`;
    const response: SPHttpClientResponse = await spHttpClient.get(
      enpointUrl,
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
        teams.push({
          email: val.Email,
          teamName: val.Name,
          department: val.Department,
          profilePic: JSON.parse(val.ProfilePic)?.serverRelativeUrl,
          region: val.Region,
        });
      });
    }
    return teams;
  }
  public async isListExists(
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
  public async createTeamList(
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
    const spOpts1: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "odata-version": "",
      },
      body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Name'}",
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
          body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Email'}",
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
              body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 34,'Title':'ProfilePic'}",
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
                  body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Department'}",
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
                      body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Region'}",
                      method: "POST",
                    };
                    spHttpClient
                      .post(url, SPHttpClient.configurations.v1, spOpts5)
                      .then(async (resut) => {
                        let data = await resut.json();
                        const spOpts6: ISPHttpClientOptions = {
                          headers: {
                            Accept: "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose",
                            "odata-version": "",
                          },
                          body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Category'}",
                          method: "POST",
                        };
                        spHttpClient
                          .post(url, SPHttpClient.configurations.v1, spOpts6)
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
      });
    // });
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
      .post(
        `${url}addViewField('Name')`,
        SPHttpClient.configurations.v1,
        spOpts1
      )
      .then(async (resut) => {
        let data = await resut.json();
        spHttpClient
          .post(
            `${url}addViewField('Email')`,
            SPHttpClient.configurations.v1,
            spOpts1
          )
          .then(async (resut) => {
            let data = await resut.json();
            spHttpClient
              .post(
                `${url}addViewField('ProfilePic')`,
                SPHttpClient.configurations.v1,
                spOpts1
              )
              .then(async (resut) => {
                let data = await resut.json();
                spHttpClient
                  .post(
                    `${url}addViewField('Department')`,
                    SPHttpClient.configurations.v1,
                    spOpts1
                  )
                  .then(async (resut) => {
                    let data = await resut.json();
                    spHttpClient
                      .post(
                        `${url}addViewField('Region')`,
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
      Name: items.Name,
      Email: items.Email,
      Department: items.Department,
      Region: items.Region,
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

  public UploadFiles(
    file: File,
    baseUrl: string,
    spHttpClient: SPHttpClient,
    listName: string,
    successFunction: (data: any) => void,
    failureFunction: (data: any) => void
  ): void {
    if (file != undefined || file != null) {
      let spOpts: ISPHttpClientOptions = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: file,
      };

      var url = `${baseUrl}/_api/Web/Lists/getByTitle('${listName}')/RootFolder/Files/Add(url='${file.name}', overwrite=true)`;

      spHttpClient
        .post(url, SPHttpClient.configurations.v1, spOpts)
        .then((response: SPHttpClientResponse) => {
          if (response.status === 200) {
            response.json().then((responseJSON: JSON) => {
              successFunction(responseJSON);
            });
          }
        });
    }
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
        Name: "Sample Team 1",
        Email: "Sample1@Email.com",
        Department: "Department 1",
        Region: "APAC",
        Category: "Sample",
      },
      (data) => {
        this.addItemInList(
          spHttpClient,
          baseUrl,
          value,
          {
            Title: "Sample Title 2",
            Name: "Sample Team 2",
            Email: "Sample2@Email.com",
            Department: "Department 2",
            Region: "EMEA",
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
    return [ab];
  }
}
