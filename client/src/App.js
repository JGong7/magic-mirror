import * as Sentry from "@sentry/browser";
import React, { useEffect, useState } from "react";
import "./App.css";
import { Calendar } from "./calendar/calendar";
import { Clock } from "./clock/clock";
import { CTA } from "./cta/cta";
import { Forecast } from "./forecastio/forecastio";
import { GooglePhotos } from "./googlePhotos/googlePhotos";
import { Quote } from "./quote/quote";
import { Updater } from "./updater/updater";
import { getApiUrl } from "./utils";

const defaultLayout = {
  topLeft: ["Clock", "Quote"],
  topRight: ["Forecast"],
  // bottomLeft: ["CTA"],
  bottomLeft: ["GooglePhotos"],
  bottomRight: ["Calendar"]
};

const Components = {
  Clock,
  CTA,
  Calendar,
  Quote,
  Forecast,
  GooglePhotos
};

Sentry.init({
  dsn: "https://4d099a17ced34c88b1211aa0017acdbf@sentry.io/1341580"
});

const App = () => {
  const [layout, setLayout] = useState({})

  const [backendInfo, setBackendInfo] = useState({});

  useEffect(() => {
    console.log("useEffect triggered for fetching backend info...");
    fetch("http://34.44.97.38:5000/")
      .then(response => {
        console.log("Fetch response received...");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Backend data received:", data);
        setBackendInfo(data);
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  }, []);

  useEffect(() => {
    const updateLayout = async () => {
      let layout;
      let apiUrl = getApiUrl("mirror/layout");
      if (window.location.search) {
        apiUrl += `${window.location.search}`;
      }
      try {
        let resp = await fetch(apiUrl);
        let body = await resp.json();
        layout = body.layout;
        console.info("Using layout from server:", layout);
      } catch (e) {
        layout = defaultLayout;
        console.warn("Could not fetch layout from server, using default:", e);
        console.info("Using default layout", layout);
      }
      setLayout(layout);
    };

    updateLayout();
    const intervalId = setInterval(updateLayout, 60 * 1000);

    return () => clearInterval(intervalId);

  }, []);


  const renderStringsToComponent = (strings) => {
    if (!strings) {
      return null;
    }

    let componentList = strings.map(s => {
      let Component = Components[s];
      return <Component key={s} />;
    });

    return <div className="box">{componentList}</div>;
  }

  return (
    <div className="App">
      <Updater />
      <div className="topLeft">
        <p>{backendInfo.welcome || "Loading..."}</p>
      </div>
      <div className="topRight">
        {renderStringsToComponent(layout.topRight)}
      </div>

      <div className="bottomLeft">
        <div className="bottom">
          {renderStringsToComponent(layout.bottomLeft)}
        </div>
      </div>
      <div className="bottomRight">
        <div className="bottom">
          {renderStringsToComponent(layout.bottomRight)}
        </div>
      </div>
    </div>
  );
}

export default App;
