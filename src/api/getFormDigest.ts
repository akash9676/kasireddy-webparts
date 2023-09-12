import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http";

export default function getFormDigest(webUrl, spHttpClient: SPHttpClient) {
  return spHttpClient.fetch(
    `${webUrl}/_api/contextinfo`,
    SPHttpClient.configurations.v1,
    {
      method: "POST",
      headers: {
        Accept: "application/json;odata.metadata=minimal",
      },
    }
  );
}
