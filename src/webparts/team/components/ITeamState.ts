import { ActionType } from "../../tiles/components/enums";

export interface ITeamState {
  status: string;
  items: ITeam[];
  isEdit: boolean;
  toShowCreateList: ActionType;
  message: string;
  listName: string;
}

export interface ITeam {
  title?: string;
  profilePic?: string;
  teamName: string;
  email: string;
  department?: string;
  region?: string;
}
