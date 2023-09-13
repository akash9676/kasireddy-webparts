import * as React from "react";
import "./index.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { IBannerItem } from "../../../webparts/project/components/IBannerItem";
import { toInteger } from "lodash";

interface IProps {
  bannerItems: IBannerItem[];
  bannerText?: string;
  textPosition?: string;
  // textSize: string;
  textSize: number;
  speed: number;
  height: number;
  dots: boolean;
  arrows: boolean;
  arrowsOnHover: boolean;
  autoPlay: boolean;
  slideView?: string;
  slideDetailPosition: string;
  slideTitleFromList: string;
  position: string;
}

const Banner: React.FC<IProps> = (props) => {
  const {
    bannerText = "",
    bannerItems,
    textPosition,
    textSize,
    speed,
    height,
    dots,
    arrows,
    autoPlay,
    slideView,
    slideDetailPosition,
    slideTitleFromList,
    arrowsOnHover,
    position = "center",
  } = props;
  const settings = {
    dots: dots,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: autoPlay,
    arrows: arrows,
    autoplaySpeed: speed * 1000,
  };

  // const textStyle = {
  //   fontSize: `${textSize}px`, // Apply the selected text size
  // };

  const imagePosition = (position: string) => {
    switch (position) {
      case "center":
        return "img-center";
      case "topLeft":
        return "img-topLeft";
      case "topCenter":
        return "img-topCenter";
      case "topRight":
        return "img-topRight";
      case "rightCenter":
        return "img-rightCenter";
      case "bottomRight":
        return "img-bottomRight";
      case "bottomCenter":
        return "img-bottomCenter";
      case "bottomLeft":
        return "img-bottomLeft";
      case "leftCenter":
        return "img-leftCenter";
      default:
        return "center";
    }
  };
  const bannerHeight = toInteger(props.height) + 50;
  let items = bannerItems.map((item) => {
    let fileExt = item.imageUrl.substring(item.imageUrl.lastIndexOf(".") + 1);
    return (
      <a
        className={`banner ${
          slideView === "slidewithDetail" ? "slidewithDetail" : ""
        } ${slideDetailPosition === "right" ? "right" : "left"}`}
        {...(item.navigationUrl ? { href: item.navigationUrl } : {})}
      >
        {fileExt === "mp4" && (
          <div
            className="img"
            style={{
              padding: "0px",
              height: height ? `${height}px` : "350px",
            }}
          >
            <video
              autoPlay
              loop
              muted
              style={{
                filter: `brightness(50%)`,
                minHeight: height ? `${height}px` : "350px",
              }}
            >
              <source src={item.imageUrl}></source>
            </video>
            <div className={`details ${textPosition}`}>
              {(slideView === "basic" || slideView === "basicwithDetail") &&
                slideTitleFromList && (
                  <h1 style={{ fontSize: `${textSize}px` }}>
                    {item.slideTitle}
                  </h1>
                )}
              {slideView === "basicwithDetail" && !slideTitleFromList && (
                <h1 style={{ fontSize: `${textSize}px` }}>{bannerText}</h1>
              )}
              {slideView === "basicwithDetail" && (
                <div className="description">{item?.slideDescription}</div>
              )}
            </div>
          </div>
        )}
        {fileExt !== "mp4" && (
          <div
            className={`img ${imagePosition(position)}`}
            style={{
              backgroundImage: `url(${item.imageUrl})`,
              minHeight: height ? `${height}px` : "350px",
            }}
          >
            <div className={`details ${textPosition}`}>
              {(slideView === "basic" || slideView === "basicwithDetail") &&
                slideTitleFromList && (
                  <h1 style={{ fontSize: `${textSize}px` }}>
                    {item.slideTitle}
                  </h1>
                )}
              {slideView === "basicwithDetail" && !slideTitleFromList && (
                <h1 style={{ fontSize: `${textSize}px` }}>{bannerText}</h1>
              )}
              {slideView === "basicwithDetail" && (
                <div className="description">{item?.slideDescription}</div>
              )}
            </div>
          </div>
        )}
        {slideView === "slidewithDetail" && (
          <div className="slide-details">
            <h2>{item?.slideTitle}</h2>
            <div className="description">{item?.slideDescription}</div>
          </div>
        )}
      </a>
    );
  });
  return (
    <div
      className={`banner-slider ${arrowsOnHover ? "arrowsOnHover" : ""}`}
      style={{ height: height ? `${bannerHeight}px` : "300px" }}
    >
      <Slider {...settings}>{items}</Slider>
      {slideView === "basic" && !slideTitleFromList && (
        <div className={`details ${textPosition}`}>
          <h1 style={{ fontSize: `${textSize}px` }}>{bannerText}</h1>
        </div>
      )}
    </div>
  );
};
export default Banner;
