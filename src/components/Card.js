import React from "react";
import RedCard from "../images/RedCard.png";
import BlueCard from "../images/BlueCard.png";
import BlackCard from "../images/BlackCard.png";
import NeutralCard from "../images/NeutralCard.png";

export default function Card(props) {
  let cssClass = "";
  let card = "";

  if (props.info.team === "Blue") {
    cssClass += " blue";
    card += BlueCard;
  } else if (props.info.team === "Red") {
    cssClass += " red";
    card += RedCard;
  } else if (props.info.team === "Assassin") {
    cssClass += " black";
    card += BlackCard;
  } else {
    cssClass += " neutral";
    card += NeutralCard;
  }

  cssClass += props.info.clicked ? " revealed" : " hidden";

  return (
    <div className={"card" + cssClass} onClick={props.onClick}>
      <div>{props.info.value}</div>
    </div>
  );
}
