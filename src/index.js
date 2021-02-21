import React from "react";
import ReactDOM from "react-dom";
import MagicDropzone from "react-magic-dropzone";
import * as bodyPix from "@tensorflow-models/body-pix";

import "@tensorflow/tfjs";

import "./styles.css";

import { loadAndUseBodyPix, estimatePersonSegmentation } from "./ai";

class App extends React.Component {
  state = {
    net: null,
    preview: ""
  };

  async componentDidMount() {
    try {
      const net = await loadAndUseBodyPix();
      this.setState({
        net
      });
    } catch {
      console.log("Error loading bodyPix net");
    }
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] });
  };

  onImageChange = (e) => {
    const imageElement = e.target;
    const WIDTH = imageElement.width;
    const HEIGHT = imageElement.height;

    console.log("Processing Model....");
    estimatePersonSegmentation(this.state.net, imageElement).then(
      (segmentation) => {
        // Convert the segmentation into a mask to darken the background.
        const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
        const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
        const backgroundDarkeningMask = bodyPix.toMask(
          segmentation,
          foregroundColor,
          backgroundColor
        );
        const canvas = document.getElementById("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext("2d");
        // ctx.drawImage(imageElement, 0, 0);

        // Get the datamap for the original image
        // const originalImageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
        // console.log(originalImageData);

        // Mask
        ctx.putImageData(backgroundDarkeningMask, 0, 0);

        // const opacity = 1;
        // const maskBlurAmount = 3;
        // const flipHorizontal = false;

        // Draw the mask onto the image on a canvas.  With opacity set to 0.7 and
        // maskBlurAmount set to 3, this will darken the background and blur the
        // darkened background's edge.
        // bodyPix.drawMask(
        //   canvas,
        //   imageElement,
        //   backgroundDarkeningMask,
        //   opacity,
        //   maskBlurAmount,
        //   flipHorizontal
        // );
      },
      (error) => console.log(error)
    );
  };

  render() {
    return (
      <div>
        {this.state.net ? (
          <>
            <MagicDropzone
              className="Dropzone"
              accept="image/jpeg, image/png, .jpg, .jpeg, .png"
              multiple={false}
              onDrop={this.onDrop}
            >
              <div className="Dropzone-content">
                {this.state.preview ? (
                  <img
                    alt="upload preview"
                    onLoad={this.onImageChange}
                    className="Dropzone-img hide"
                    src={this.state.preview}
                  />
                ) : (
                  "Click to Choose an image."
                )}
              </div>
            </MagicDropzone>
            <canvas id="canvas" />
          </>
        ) : (
          <div className="Dropzone">Loading net...</div>
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
