import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IProjectProps {
  context: WebPartContext;
  listName: string;
  textPosition: string;
  bannerImagePosition: string;
  // textSize: string;
  textSize: number;
  speed: number;
  height: number;
  dots: boolean;
  arrows: boolean;
  autoPlay: boolean;
  slideView: string;
  slideDetailPosition: string;
  slideTitleFromList: string;
  arrowsOnMouseOver: boolean;
  category: string;
}
