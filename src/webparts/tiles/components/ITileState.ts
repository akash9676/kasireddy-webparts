import { ActionType } from "./enums";
import { ITileItem } from "./ITileItem";

export interface ITileState {
  status: string;
  items: ITileItem[];
  isEdit: boolean;
  toShowCreateList: ActionType;
  message: string;
  listName: string;
}
