import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";
import { IPropertyPaneDropdownOption } from "@microsoft/sp-property-pane";
import { IODataList } from "@microsoft/sp-odata-types";

export async function fetchList(
  spHttpClient: SPHttpClient,
  currentWebUrl: string
): Promise<IPropertyPaneDropdownOption[]> {
  var options: Array<IPropertyPaneDropdownOption> =
    new Array<IPropertyPaneDropdownOption>();
  var url = `${currentWebUrl}/_api/web/lists?$filter=Hidden eq false and BaseTemplate eq 100`;
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
    responseJson.value.map((list: IODataList) => {
      options.push({ key: list.Title, text: list.Title });
    });
  }
  return options;
}
