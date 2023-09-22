import {
  SPHttpClient,
  SPHttpClientResponse,
  ISPHttpClientOptions,
  HttpClient,
} from "@microsoft/sp-http";
import { SampleImages } from "../../utils/sample/SampleImages";
import { ITileItem } from "../../webparts/tiles/components/ITileItem";
import getFormDigest from "../getFormDigest";
import { Utility } from "../utility";

export class TileAPI {
  public async getTiles(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    numberOfItems: number,
    categoryName: string
  ): Promise<ITileItem[]> {
    let tileItem: ITileItem[] = [];
    const topOperator =
      numberOfItems !== undefined && numberOfItems > 0
        ? `$top=${numberOfItems}&`
        : "";
    const categoryFilter: string =
      categoryName === undefined || categoryName === "All"
        ? ""
        : `&$filter=Category eq '${categoryName}'`;
    const bannerEnpointUrl: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/items?${topOperator}$select=EncodedAbsUrl,TileTitle,TileDescription,NavigationUrl${categoryFilter}`;
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
        tileItem.push({
          imageUrl: val.EncodedAbsUrl,
          tileDescription: val?.TileDescription,
          tileTitle: val?.TileTitle,
          navigationUrl: val.NavigationUrl
            ? Utility.IsUrlAbsolute(val.NavigationUrl)
              ? val.NavigationUrl
              : baseUrl + val.NavigationUrl
            : null,
        });
      });
    }
    return tileItem;
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
      BaseTemplate: 101,
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
    // forEach(columnDefinations, function (value, key) {
    const spOpts1: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "odata-version": "",
      },
      body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'TileTitle'}",
      method: "POST",
    };
    spHttpClient
      .post(url, SPHttpClient.configurations.v1, spOpts1)
      .then(async (resut) => {
        let data = await resut.json();
        console.log(data);
        const spOpts2: ISPHttpClientOptions = {
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "odata-version": "",
          },
          body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'TileDescription'}",
          method: "POST",
        };
        spHttpClient
          .post(url, SPHttpClient.configurations.v1, spOpts2)
          .then(async (resut) => {
            let data = await resut.json();
            console.log(data);
            const spOpts3: ISPHttpClientOptions = {
              headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "odata-version": "",
              },
              body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'NavigationUrl'}",
              method: "POST",
            };
            spHttpClient
              .post(url, SPHttpClient.configurations.v1, spOpts3)
              .then(async (resut) => {
                let data = await resut.json();
                console.log(data);
                const spOpts4: ISPHttpClientOptions = {
                  headers: {
                    Accept: "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "odata-version": "",
                  },
                  body: "{'__metadata':{'type': 'SP.Field'},'FieldTypeKind': 2,'Title':'Category'}",
                  method: "POST",
                };
                spHttpClient
                  .post(url, SPHttpClient.configurations.v1, spOpts4)
                  .then(async (resut) => {
                    let data = await resut.json();
                    console.log(data);
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
    // });
  }
  public addView(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    successFunction: (data: any) => void
  ) {
    const url: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/Views/GetByTitle('All%20Documents')/ViewFields/`;
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
        `${url}addViewField('TileTitle')`,
        SPHttpClient.configurations.v1,
        spOpts1
      )
      .then(async (resut) => {
        let data = await resut.json();
        spHttpClient
          .post(
            `${url}addViewField('TileDescription')`,
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
  }

  public async addItemInList(
    spHttpClient: SPHttpClient,
    baseUrl: string,
    listName: string,
    items: any,
    imgUniqueId: string,
    successFunction: (data: any) => void,
    failureFunction: (data: any) => void
  ): Promise<void> {
    const listEndPointUrl: string = `${baseUrl}/_api/web/lists/GetByTitle('${listName}')/items?$orderby=Id desc&$top=1&$select=Id`;
    let ItemIdResult = await spHttpClient.get(
      listEndPointUrl,
      SPHttpClient.configurations.v1
    );

    let result = await ItemIdResult.json();
    console.log(result, "id");
    const modifyListUrl: string = `${baseUrl}/_api/web/lists/getByTitle('${listName}')/items(${result.value[0].Id})`;

    const listItem: any = {
      // __metadata: { type: `SP.Data.${listName}Item` },
      TileTitle: items.TileTitle,
      TileDescription: items.TileDescription,
      NavigationUrl: items.NavigationUrl,
      Category: items.Category,
    };
    const spOpts: ISPHttpClientOptions = {
      headers: {
        Accept: "application/json;odata=nometadata",
        "Content-type": "application/json;odata=nometadata",
        "odata-version": "",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify(listItem),
    };
    await spHttpClient
      .post(modifyListUrl, SPHttpClient.configurations.v1, spOpts)
      .then(
        async (response: SPHttpClientResponse) => {
          // let result = await response.json();
          console.log(result);
          if (response.status === 200 || response.status === 204) {
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
    let byeArray = this.dataURItoBlob(SampleImages.SAMPLE_IMAGE1);
    let fileObject = new File(byeArray, "SampleImage1.jpg");
    this.UploadFiles(
      fileObject,
      baseUrl,
      spHttpClient,
      value,
      (data) => {
        console.log(data);
        this.addItemInList(
          spHttpClient,
          baseUrl,
          value,
          {
            TileTitle: "Sample Tile Title 1",
            TileDescription: "Sample Tile Description 1",
            NavigationUrl: "",
            Category: "Sample",
          },
          "",
          (data) => {
            console.log(data, "Image2");
            let byeArray = this.dataURItoBlob(SampleImages.SAMPLE_IMAGE2);
            let fileObject = new File(byeArray, "SampleImage2.jpg");
            this.UploadFiles(
              fileObject,
              baseUrl,
              spHttpClient,
              value,
              (data) => {
                this.addItemInList(
                  spHttpClient,
                  baseUrl,
                  value,
                  {
                    TileTitle: "Sample Tile Title 2",
                    TileDescription: "Sample Tile Description 2",
                    NavigationUrl: "",
                    Category: "Sample",
                  },
                  "",
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
