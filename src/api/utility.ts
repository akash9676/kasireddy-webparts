export class Utility {
  public static IsUrlAbsolute = (url) =>
    url.indexOf("//") === 0
      ? true
      : url.indexOf("://") === -1
      ? false
      : url.indexOf(".") === -1
      ? false
      : url.indexOf("/") === -1
      ? false
      : url.indexOf(":") > url.indexOf("/")
      ? false
      : url.indexOf("://") < url.indexOf(".")
      ? true
      : false;
}
