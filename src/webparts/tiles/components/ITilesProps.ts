import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISeeMoreSettings } from "../../../settings/seeMoreSettings/ISeeMoreSettings";

export interface ITilesProps extends ISeeMoreSettings {
  context: WebPartContext;
  description: string;
  listName: string;
  viewType: string;
  columns: string;
  titlePosition: string;
  textPosition: string;
  separator: boolean;
  category: string;
  overlayTransparent: string;
  autoHeight: boolean;
  numberOfLine: string;
}
