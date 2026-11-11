import { TAIPEI } from "../content/news";
import "./TaitronicsArt.css";

/** The TAITRONICS item's picture: the event's marks — AIoT Taiwan's over
 *  TAITRONICS', a rule between — Mexico Business News' under them, and Taipei
 *  in a diamond, ringed. Drawn on the 320 × 198 panel in two layers, each as
 *  tall as the box it fills: the marks held to its left, the diamond to its
 *  right. Fills the News page's featured panel, its grid card's picture, and
 *  its article's cover (decorative there: each box names it, or doesn't need
 *  to). */
export default function TaitronicsArt() {
  return (
    <span className="taitronics-art" aria-hidden>
      <span className="taitronics-art__layer taitronics-art__layer--right">
        <span className="taitronics-art__diamond">
          <img src={TAIPEI} alt="" />
        </span>
        <span className="taitronics-art__ring" />
      </span>
      <span className="taitronics-art__layer">
        <span className="taitronics-art__aiot-mark" />
        <span className="taitronics-art__aiot-name">AIoT Taiwan</span>
        <span className="taitronics-art__aiot-tagline">Taiwan International AIoT Show</span>
        <span className="taitronics-art__rule" />
        <span className="taitronics-art__taitronics" />
        <span className="taitronics-art__mbn" />
      </span>
    </span>
  );
}
