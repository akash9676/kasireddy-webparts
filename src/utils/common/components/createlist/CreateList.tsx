import * as React from "react";
import { useState } from "react";
import styles from "./CreateList.module.scss";

interface IProps {
  onCreateList: Function;
  message: string;
  baseUrl: string;
  isDocumentLib: boolean;
}

const CreateList: React.FC<IProps> = (props) => {
  const { onCreateList, message, baseUrl, isDocumentLib } = props;
  const [listName, setListName] = useState("");
  const [createNewList, setCreateNewList] = useState(false);
  const onUpdateListName = (value) => {
    setListName(value);
  };
  let listPage = isDocumentLib ? "/Forms/AllItems.aspx" : "/AllItems.aspx";
  const link = isDocumentLib
    ? `${baseUrl}/${listName
        .split("-")
        .map((e) => e)
        .join("")}${listPage}`
    : `${baseUrl}/Lists/${listName
        .split("-")
        .map((e) => e)
        .join("")}${listPage}`;
  function handleClick(event) {
    onCreateList(listName);
  }
  const toggleCreateList = () => {
    setCreateNewList(!createNewList);
  };
  return (
    <div>
      <div className={`${styles["d-flex"]} ${styles["just-right"]}`}>
        <span
          className={`${styles["createListToggleIcon"]} ${
            createNewList ? styles["minusIcon"] : styles["plusIcon"]
          }`}
          onClick={toggleCreateList}
          title="Create New List"
        ></span>
      </div>{" "}
      {createNewList && (
        <div className={`${styles["newListCreation"]}`}>
          <div
            className={`${styles["form-group"]}  ${styles["flex-direction--row"]} ${styles["align-items--center"]}`}
          >
            <label className={`${styles["form-label"]}`}>Create New List</label>
            <input
              className={`${styles["form-control"]}`}
              type="listName"
              id="txtListName"
              value={listName}
              required
              onChange={(e) => onUpdateListName(e.target.value)}
            />
            <button
              type="button"
              className={`${styles["button"]}`}
              onClick={handleClick}
            >
              Create
            </button>
          </div>

          {message !== "" && (
            <>
              <div className={`${styles["success-message"]}`}>
                &nbsp;&nbsp;
                {message}
              </div>
              <a
                className={`${styles["add-item"]}`}
                href={link}
                target="_blank"
              >
                Go To {isDocumentLib ? "Library" : "List"}
              </a>
            </>
          )}

          <hr className={`${styles["hr"]}`} />
          <h3 className={`${styles["previewText"]}`}>Preview</h3>
        </div>
      )}
    </div>
  );
};

export default CreateList;
