import { ActionType } from "../../tiles/components/enums";
import { IBannerItem } from "./IBannerItem";

export interface IProjectState {
  status: string;
  message: string;
  items: IBannerItem[];
  listName: string;
  slideTitle: string;
  slideDescription: string;
  navigationUrl: string;
  fileName: File;
  toShowCreateList: ActionType;
  isEdit: boolean;
}
