import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { IPropertyPaneDropdownOption } from "@microsoft/sp-property-pane";
import * as _ from "lodash";

export async function fetchListCategory(
  spHttpClient: SPHttpClient,
  currentWebUrl: string,
  listName: string
): Promise<IPropertyPaneDropdownOption[]> {
  var options: Array<IPropertyPaneDropdownOption> =
    new Array<IPropertyPaneDropdownOption>();
  options.push({ key: "All", text: "All" });
  var url = `${currentWebUrl}/_api/web/lists/GetByTitle('${listName}')/items?$select=Category&$filter=Category ne null`;
  const response: SPHttpClientResponse = await spHttpClient.get(
    url,
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
    let result = _.uniqBy(responseJson.value, "Category");
    result.map((list: any) => {
      options.push({ key: list.Category, text: list.Category });
    });
  }
  return options;
}
