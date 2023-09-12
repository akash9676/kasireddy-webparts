import { ActionType } from "../../tiles/components/enums";
import { INavigationItem } from "./INavigationItem";

export interface INavigationState {
  status: string;
  items: INavigationItem[];
  listName: string;
  message: string;
  id: number;
  title: string;
  description: string;
  navigationUrl: string;
  parent: number;
  isEdit: boolean;
  toShowCreateList: ActionType;
}
