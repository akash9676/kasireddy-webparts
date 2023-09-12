import * as React from "react";
import { useEffect, useState } from "react";
import { ITeam } from "../../../webparts/team/components/ITeamState";
import "./index.scss";
import * as _ from "lodash";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { ISeeMoreSettings } from "../../../settings/seeMoreSettings/ISeeMoreSettings";

const defaultProfilePic = `data:image/png;base64,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`;
const iconTeam =
  "data:image/png;base64,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";
interface IProps {
  title?: string;
  teams: ITeam[];
  titlePosition?: string;
  roundedCorner?: boolean;
  columns?: string;
  isRegionDisplay: boolean;
  viewType?: string;
  speed: number;
  arrows: boolean;
  arrowsOnHover: boolean;
  autoPlay: boolean;
  dots: boolean;
  slideToShow: number;
  slideToScroll: number;
  seeMoreSettings: ISeeMoreSettings;
  roundedCornerPx: string;
}
const Teams: React.FC<IProps> = (props) => {
  let {
    title = "",
    teams,
    titlePosition,
    roundedCorner = false,
    columns = "3",
    isRegionDisplay,
    viewType,
    speed,
    arrows,
    autoPlay,
    dots,
    slideToShow,
    slideToScroll,
    arrowsOnHover,
    seeMoreSettings,
    roundedCornerPx,
  } = props;
  const settings = {
    dots: dots,
    infinite: true,
    speed: speed,
    slidesToShow: slideToShow,
    slidesToScroll: slideToScroll,
    autoplay: autoPlay,
    arrows: arrows,
  };
  useEffect(() => {
    columnSize(columns);
  }, [columns]);
  const columnSize = (columns: string) => {
    switch (columns) {
      case "1":
        return "columns-1";
      case "2":
        return "columns-2";
      case "3":
        return "columns-3";
      case "4":
        return "columns-4";
      case "5":
        return "columns-5";
      case "6":
        return "columns-6";
      default:
        return "columns-2";
    }
  };
  const [teamList, setTeamList] = useState(teams);
  const [buttonActive, setButtonActive] = useState("Show All");

  useEffect(() => {
    setButtonActive(buttonActive);
  }, [buttonActive]);

  useEffect(() => {
    setTeamList(teams);
  }, [teams]);
  let blockTeamItem: any;

  let teamItem = teamList?.map((item) => (
    <div
      className={`team ${roundedCorner ? "rounded-corners" : ""}`}
      style={{
        borderRadius: roundedCornerPx + "px",
      }}
    >
      <div className="profile-pic">
        <img
          className={item?.profilePic ? "" : "default-profile-pic"}
          src={item?.profilePic ? item?.profilePic : defaultProfilePic}
        />
      </div>
      <div className="details">
        <h4>{item?.teamName}</h4>
        <span className="department">{item?.department}</span>
        <a href={`mailto:${item?.email}`} className="email">
          {item?.email}
        </a>
      </div>
    </div>
  ));
  if (viewType === "block") {
    blockTeamItem = teamList?.map((item) => (
      <div
        className={`team ${roundedCorner ? "rounded-corners" : ""}`}
        style={{
          borderRadius: roundedCornerPx + "px",
        }}
      >
        <div className="profile-pic">
          <img
            className={item?.profilePic ? "" : "default-profile-pic"}
            src={item?.profilePic ? item?.profilePic : defaultProfilePic}
          />
        </div>
        <div className="details">
          <h4>{item?.teamName}</h4>
          <div className="data">
            <div className="data-item">
              <span className="icon">
                <img src={iconTeam} />
              </span>
              <span className="label">Department:</span>
              <span className="text">{item?.department}</span>
            </div>
            <div className="data-item">
              <span className="icon">
                <img src={iconTeam} />
              </span>
              <span className="label">Email:</span>
              <span className="text">
                <a href={`mailto:${item?.email}`} className="email">
                  {item?.email}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  let regions = _.uniq(
    _.map(
      _.filter(teams, function (o) {
        return o.region != undefined;
      }),
      "region"
    )
  );
  let regionClick = (regionName: string) => {
    let result: ITeam[];
    if (regionName !== "Show All") {
      result = teams.filter((l) => l.region === regionName);
      setTeamList(result);
    } else {
      setTeamList([...teams]);
    }
    //  region = regionName;
    setButtonActive(regionName);
  };
  regions = regions.length > 0 ? [...regions, "Show All"] : [];
  return (
    <div className="teams-container">
      <h3 className={`title ${titlePosition}`}>{title}</h3>
      {regions.length > 0 && isRegionDisplay ? (
        <div className="regions">
          {regions?.map((region: string) => {
            return (
              <>
                <button
                  className={`${roundedCorner ? "rounded-corners" : ""} ${
                    buttonActive === region ? "active" : ""
                  }`}
                  onClick={() => regionClick(region)}
                  style={{
                    borderRadius: roundedCornerPx + "px",
                  }}
                >
                  {region}
                </button>
              </>
            );
          })}
        </div>
      ) : (
        ""
      )}
      {viewType === "slide" ? (
        <div className={`teams-slider ${arrowsOnHover ? "arrowsOnHover" : ""}`}>
          {teamList.length > 1 ? (
            <Slider {...settings}>{teamItem}</Slider>
          ) : (
            <div className={`teams ${columnSize(columns)}`}>{teamItem}</div>
          )}
        </div>
      ) : viewType === "block" ? (
        <div className={`teams ${columnSize(columns)} blockItem`}>
          {blockTeamItem}
        </div>
      ) : (
        <div className={`teams ${columnSize(columns)}`}>{teamItem}</div>
      )}
      {seeMoreSettings && seeMoreSettings.seeMoreSettingEnable && (
        <a
          href={seeMoreSettings.seeMoreLinkUrl}
          className={`seeMore ${seeMoreSettings.seeMoreTextPosition}`}
        >
          {seeMoreSettings.seeMoreText}
        </a>
      )}
    </div>
  );
};
export default Teams;
