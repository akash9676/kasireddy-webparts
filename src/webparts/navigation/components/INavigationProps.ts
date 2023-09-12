import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface INavigationProps {
  context: WebPartContext;
  listName: string;
  description: string;
  name: string;
  parentId: boolean;
  id: number;
  category: string;
}
