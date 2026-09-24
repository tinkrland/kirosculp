import { Camera, CircleHelp, Cog, Gem, Hand, Images, Workflow } from "lucide-react";

export const studiogramGuides = [
  {
    slug: "why",
    step: "00",
    icon: CircleHelp,
    eyebrow: "understand the purpose",
    title: "why studiogram exists",
    summary: "close the photography gap between a finished digital design and the first physical casting.",
    introduction: "made-to-order jewelry can be ready to validate and list before a physical sample exists. studiogram gives creators a way to present that exact design without first arranging casting, a model, a camera, and a physical shoot.",
    sections: [
      {
        title: "photography normally comes last",
        body: "traditional product photography begins after a piece has been manufactured. that makes every new listing depend on an upfront sample, even when the design is already complete and manufacturable as a digital object.",
        points: ["no sample required before listing", "less upfront production", "earlier product presentation"],
      },
      {
        title: "the design is already real",
        body: "the artifact already has defined geometry, dimensions, materials, and manufacturing constraints. studiogram photographs that existing object rather than asking another system to invent an approximation of it.",
        points: ["actual compiled geometry", "design and image stay aligned", "no imagined replacement"],
      },
      {
        title: "creators keep control",
        body: "the hand, jewelry arrangement, camera, light, and backdrop remain adjustable parts of a saved scene. creators direct the result and can return to the same setup whenever the listing changes.",
        points: ["creator-directed scenes", "repeatable results", "reusable setups"],
      },
    ],
  },
  {
    slug: "howitworks",
    step: "guide",
    icon: Workflow,
    eyebrow: "follow the complete flow",
    title: "how studiogram works",
    summary: "move from a compiled jewelry design to an ordered set of product images through one reproducible scene.",
    introduction: "studiogram begins after the artifact has become a compiled mesh. a creator chooses a hand, arranges jewelry, directs the scene, and captures several views without creating a second version of the product.",
    sections: [
      {
        title: "prepare the subject",
        body: "choose a saved hand or shape a new one, then add one or more compiled artifacts. every piece attaches to a named location and remains an independent object in the scene.",
        points: ["configure the hand", "add compiled artifacts", "place and stack pieces"],
      },
      {
        title: "direct the scene",
        body: "set the hand pose, camera framing, lighting, and environment. each control changes one part of the scene while preserving every other choice.",
        points: ["pose the rig", "frame the camera", "shape light and backdrop"],
      },
      {
        title: "capture the set",
        body: "save a frame, adjust the scene, and save another. the resulting image set can be reviewed, ordered, and exported as png files for a product carousel.",
        points: ["capture several views", "review the sequence", "export png images"],
      },
    ],
  },
  {
    slug: "hand",
    step: "01",
    icon: Hand,
    eyebrow: "build the subject",
    title: "choose and shape a hand",
    summary: "start with one configurable hand model, then shape its proportions and surface without swapping it for a different person.",
    introduction: "every variation begins with the same base hand. presentation, build, proportions, skin, nails, body hair, and tattoos are independent choices that can be saved together as a reusable hand configuration.",
    sections: [
      {
        title: "one hand, many proportions",
        body: "presentation and build are separate controls on one hand model. finer controls can shape hand width, finger length, finger thickness, and palm proportions. this keeps every setup flexible without maintaining a different hand model for every combination.",
        points: ["neutral, masculine, and feminine presentation presets", "independent build and proportion controls", "one reusable base hand rather than a library of people"],
      },
      {
        title: "surface details stay separate",
        body: "skin tone, body hair, and nail appearance affect the surface rather than replacing the underlying hand. tattoos are placed on the skin and become part of its surface so they continue to move naturally when the hand is posed.",
        points: ["skin tone and body hair controls", "nail length, shape, and appearance", "surface-aware tattoo placement"],
      },
      {
        title: "save a hand once",
        body: "a saved hand configuration keeps the complete set of shape and surface choices. a creator can maintain several configurations and reuse them across shoots while selecting jewelry separately for each scene.",
        points: ["multiple saved configurations", "reusable across product shoots", "kept independent from jewelry arrangements"],
      },
    ],
  },
  {
    slug: "jewelry",
    step: "02",
    icon: Gem,
    eyebrow: "place the artifacts",
    title: "add and arrange jewelry",
    summary: "bring the same modeled artifact used for manufacturing into the scene, then position and stack pieces without flattening them into an image.",
    introduction: "studiogram uses the artifact's compiled 3d form. it does not redraw the piece for the photograph, so the object shown to a buyer remains tied to the design that would be manufactured.",
    sections: [
      {
        title: "the real artifact enters the scene",
        body: "the studio receives the same compiled artifact used by sculptura's viewer. information needed for placement travels with the design instead of being recreated after it reaches the studio.",
        points: ["one artifact representation", "manufacturing and photography stay aligned", "placement information remains part of the design"],
      },
      {
        title: "attach it to the hand",
        body: "a piece is placed at a named location such as a finger, wrist, or earlobe. when the hand changes pose, the jewelry follows that location rather than staying frozen in space.",
        points: ["finger, wrist, and earlobe placement", "position and orientation controls", "jewelry follows the hand's pose"],
      },
      {
        title: "compose a stack",
        body: "several pieces can share a scene. creators can reorder a stack, adjust supported positions, remove one piece, or combine available work from more than one creator while each artifact remains its own object.",
        points: ["multiple independent pieces", "reorderable stacks", "support for available cross-creator artifacts"],
      },
    ],
  },
  {
    slug: "scene",
    step: "03",
    icon: Camera,
    eyebrow: "direct the photograph",
    title: "pose and light the scene",
    summary: "treat the hand, camera, light, and backdrop as separate parts of one repeatable photography setup.",
    introduction: "after the hand and jewelry are arranged, creators direct the scene much like a physical shoot. every choice belongs to the saved scene, so the same setup can be reconstructed later.",
    sections: [
      {
        title: "pose the hand",
        body: "pose controls move the hand's rig. attached jewelry follows its assigned location automatically, allowing relaxed, spread, and gesture-based compositions without rebuilding the scene.",
        points: ["reusable pose states", "attached pieces move with the hand", "no repainting between poses"],
      },
      {
        title: "frame with a real camera",
        body: "the camera can orbit an already composed scene. its position, angle, and framing change the view, not the jewelry or hand underneath it.",
        points: ["full orbit control", "adjustable position and angle", "repeatable framing"],
      },
      {
        title: "shape light and environment",
        body: "lighting and backdrop are independent from the camera. presets provide a starting point, while the same values remain available for manual adjustment when a creator needs a more specific look.",
        points: ["adjustable lighting", "backdrop presets", "manual control over preset values"],
      },
    ],
  },
  {
    slug: "capture",
    step: "04",
    icon: Images,
    eyebrow: "finish the shoot",
    title: "capture and export the set",
    summary: "save several views from the same scene, review their order, and export a clean image set for a product carousel.",
    introduction: "capture happens after the scene is composed. each shot records the current hand, jewelry, pose, camera, lighting, and backdrop, making the result repeatable rather than an isolated generated image.",
    sections: [
      {
        title: "capture one composed frame",
        body: "a capture records the current scene as one photograph. creators can then change the pose or camera and capture another view without rebuilding the hand or replacing the jewelry.",
        points: ["one frame per capture", "same scene across alternate views", "repeatable from saved scene choices"],
      },
      {
        title: "build a small photo set",
        body: "a typical session can produce three or four complementary shots. these may show different angles, closer details, or a new pose while keeping the product consistent throughout.",
        points: ["several related views", "consistent artifact geometry", "room for detail and context shots"],
      },
      {
        title: "export for publishing",
        body: "the finished set exports as png images intended for a carousel. attribution, captions, links, and posting remain with the creator on the platform where the images will be shared.",
        points: ["png image set", "carousel-ready ordering", "creator-controlled publishing and attribution"],
      },
    ],
  },
  {
    slug: "bts",
    step: "bts",
    icon: Cog,
    eyebrow: "look behind the scenes",
    title: "behind the scenes",
    summary: "see how one saved scene keeps the real artifact, hand rig, camera, lighting, and output connected.",
    introduction: "studiogram is a deterministic 3d scene system, not image generation. every photograph is the rendered result of explicit geometry and saved scene choices.",
    sections: [
      {
        title: "one artifact flows through",
        body: "the studio consumes the same compiled mesh used by the artifact viewer. attachment information belongs to the canonical design record, so photography never becomes a separate copy of the jewelry.",
        points: ["one canonical design", "shared compiled mesh", "upstream attachment data"],
      },
      {
        title: "the hand is a rigged system",
        body: "one base hand uses shape controls for morphology and material controls for surface appearance. named attachment spaces allow jewelry to follow fingers, wrists, and other supported locations when the pose changes.",
        points: ["one parameterized hand", "separate surface controls", "rig-aware attachments"],
      },
      {
        title: "a scene is reproducible",
        body: "pose, camera, lighting, environment, and object transforms are saved as scene state. the same values can reconstruct the same view for later edits, exports, and visual checks.",
        points: ["saved scene values", "repeatable rendering", "consistent product views"],
      },
    ],
  },
];

export function getStudiogramGuide(pageName) {
  return studiogramGuides.find((guide) => guide.slug === pageName);
}
