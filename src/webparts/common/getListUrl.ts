export function getListUrl(
  isDocumentLib: boolean,
  listName: string,
  baseUrl: string
): string {
  let listPage = isDocumentLib ? "/Forms/AllItems.aspx" : "/AllItems.aspx";
  const link = isDocumentLib
    ? `${baseUrl}/${listName
        .split("-")
        .map((e) => e)
        .join("")}${listPage}`
    : `${baseUrl}/Lists/${listName
        .split("-")
        .map((e) => e)
        .join("")}${listPage}`;
  return link;
}
