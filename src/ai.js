import * as bodyPix from "@tensorflow-models/body-pix";

async function loadAndUseBodyPix() {
  const net = await bodyPix.load({
    architecture: "ResNet50",
    outputStride: 16,
    quantBytes: 4
  });
  console.log("BodyPix model loaded");

  return net;
}

async function estimatePersonSegmentation(net, imageElement) {
  const personSegmentation = await net.segmentPerson(imageElement, {
    internalResolution: "full",
    segmentationThreshold: 0.2,
    nmsRadius: 1
  });

  return personSegmentation;
}

export { loadAndUseBodyPix, estimatePersonSegmentation };
