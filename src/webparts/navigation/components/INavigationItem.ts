export interface INavigationItem {
  id: number;
  name: string;
  description: string;
  parentid: number;
  children?: INavigationItem[];
  navigationUrl: string;
}
