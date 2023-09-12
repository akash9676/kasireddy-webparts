import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISeeMoreSettings } from "../../../settings/seeMoreSettings/ISeeMoreSettings";

export interface ITeamProps extends ISeeMoreSettings {
  context: WebPartContext;
  description: string;
  listName: string;
  titlePosition: string;
  columns: string;
  roundedCorner: boolean;
  isRegionDisplay: boolean;
  viewType: string;
  speed: number;
  dots: boolean;
  arrows: boolean;
  autoPlay: boolean;
  slideToScroll: number;
  slideToShow: number;
  arrowsOnMouseOver: boolean;
  category: string;
  roundedCornerPx: string;
}
