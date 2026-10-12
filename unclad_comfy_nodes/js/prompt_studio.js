import { app } from "../../scripts/app.js";


const TARGET_NODE = "UCNPromptStudio";

const PRESET_ENDPOINT =
    "/unclad-comfy-nodes/prompt-studio/presets";

const THUMBNAIL_ROOT =
    "/unclad-comfy-nodes/thumbnails";

const THUMBNAIL_EXTENSIONS = [
    "webp",
    "jpg",
    "jpeg",
    "png",
];

const THUMBNAIL_CACHE_VERSION = "8";


const LIBRARY_CONFIG = {
    look_and_feel: {
        title: "Look & Feel Library",
        search: "Search styles...",

        tabs: [
            "All",
            "Realism",
            "Fine Art",
            "Illustration",
            "Cartoon & Animation",
        ],

        categories: {
            "Photorealistic":
                "Realism",

            "Renaissance Painting":
                "Fine Art",

            "Baroque Painting":
                "Fine Art",

            "Romantic Painting":
                "Fine Art",

            "Impressionist Painting":
                "Fine Art",

            "Watercolor Painting":
                "Fine Art",

            "Charcoal Drawing":
                "Fine Art",

            "Surrealist Painting":
                "Fine Art",

            "Book Illustration":
                "Illustration",

            "Pencil Sketch":
                "Illustration",

            "Hand-Colored Coloring Book":
                "Illustration",

            "Professional Marker Illustration":
                "Illustration",

            "Art Nouveau":
                "Illustration",

            "Art Deco":
                "Illustration",

            "Fantasy Concept Art":
                "Illustration",

            "Vector Illustration":
                "Illustration",

            "Norman Rockwell":
                "Illustration",

            "Hyper-Stylized 3D Cel-Shaded":
                "Cartoon & Animation",

            "Comic Book Illustration":
                "Cartoon & Animation",

            "Classic Comic Book":
                "Cartoon & Animation",

            "Saturday Morning Cartoon":
                "Cartoon & Animation",

            "Pixar-Inspired 3D":
                "Cartoon & Animation",

            "Anime Illustration":
                "Cartoon & Animation",

            "Sunday Comic Strip":
                "Cartoon & Animation",
        },

        defaultCategory:
            "Illustration",
    },


    lighting: {
        title:
            "Lighting Library",

        search:
            "Search lighting...",

        tabs: [
            "All",
            "Outdoor",
            "Indoor",
            "Studio & Portrait",
            "Stylized",
        ],

        categories: {
            "Natural Daylight":
                "Outdoor",

            "Golden Hour":
                "Outdoor",

            "Overcast Soft Light":
                "Outdoor",

            "Hard Sunlight":
                "Outdoor",

            "Window Light":
                "Indoor",

            "Candlelight":
                "Indoor",

            "Studio Softbox":
                "Studio & Portrait",

            "Rembrandt Portrait":
                "Studio & Portrait",

            "Low Key":
                "Studio & Portrait",

            "High Key":
                "Studio & Portrait",

            "Cinematic Dramatic":
                "Stylized",

            "Backlit Rim Light":
                "Stylized",

            "Neon Urban Night":
                "Stylized",

            "Stage Spotlight":
                "Stylized",
        },

        defaultCategory:
            "Stylized",
    },


    camera: {
        title:
            "Camera Library",

        search:
            "Search camera presets...",

        tabs: [
            "All",
            "Portrait & Studio",
            "Wide & Environmental",
            "Cinematic & Specialty",
            "Candid & Documentary",
        ],

        categories: {
            "Natural 50mm":
                "Portrait & Studio",

            "85mm Portrait":
                "Portrait & Studio",

            "135mm Telephoto":
                "Portrait & Studio",

            "Medium Format":
                "Portrait & Studio",

            "24mm Wide Angle":
                "Wide & Environmental",

            "16mm Ultra Wide":
                "Wide & Environmental",

            "Action Camera":
                "Wide & Environmental",

            "Macro Photography":
                "Cinematic & Specialty",

            "Cinematic Anamorphic":
                "Cinematic & Specialty",

            "Vintage 35mm Film Camera":
                "Cinematic & Specialty",

            "35mm Documentary":
                "Candid & Documentary",

            "Smartphone Candid":
                "Candid & Documentary",
        },

        defaultCategory:
            "Cinematic & Specialty",
    },


    creative_enhancements: {
        title:
            "Creative Enhancements Library",

        search:
            "Search enhancements...",

        tabs: [
            "All",
            "Seasonal & Celebration",
            "Color & Tone",
            "Mood & Atmosphere",
            "Finish & Treatment",
        ],

        categories: {
            "Subtle Christmas":
                "Seasonal & Celebration",
            "Christmas":
                "Seasonal & Celebration",
            "Halloween":
                "Seasonal & Celebration",
            "Cute / Whimsical Halloween":
                "Seasonal & Celebration",
            "Autumn Harvest":
                "Seasonal & Celebration",

            "Sepia Tone":
                "Color & Tone",
            "High Contrast":
                "Color & Tone",
            "Muted Palette":
                "Color & Tone",
            "Vibrant Color":
                "Color & Tone",
            "Monochrome":
                "Color & Tone",

            "Cozy":
                "Mood & Atmosphere",
            "Dreamy":
                "Mood & Atmosphere",
            "Magical":
                "Mood & Atmosphere",
            "Mysterious":
                "Mood & Atmosphere",
            "Nostalgic":
                "Mood & Atmosphere",

            "Soft Glow":
                "Finish & Treatment",
            "Filmic Finish":
                "Finish & Treatment",
            "Matte Finish":
                "Finish & Treatment",
            "Vintage Fade":
                "Finish & Treatment",
            "Rich Tonal Depth":
                "Finish & Treatment",
        },

        defaultCategory:
            "Mood & Atmosphere",
    },
};


let presetCache = null;


async function loadPresets() {
    if (presetCache) {
        return presetCache;
    }

    const response =
        await fetch(
            PRESET_ENDPOINT,
            {
                cache:
                    "no-store",
            }
        );

    if (!response.ok) {
        throw new Error(
            `Preset request failed: ${response.status}`
        );
    }

    presetCache =
        await response.json();

    return presetCache;
}


function slugify(value) {
    return String(
        value ?? ""
    )
        .normalize(
            "NFKD"
        )

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /&/g,
            " and "
        )

        .replace(
            /[’']/g,
            ""
        )

        .replace(
            /[^a-zA-Z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        )

        .toLowerCase();
}


function cleanPart(value) {
    return String(
        value ?? ""
    )
        .trim()

        .replace(
            /^[\s,;]+|[\s,;]+$/g,
            ""
        );
}


function joinParts(parts) {
    return parts
        .map(
            cleanPart
        )

        .filter(
            Boolean
        )

        .join(
            ", "
        );
}


function findWidget(
    node,
    name
) {
    return node.widgets?.find(
        (widget) =>
            widget.name ===
            name
    );
}


/*
 * ---------------------------------------------------------
 * SHORTEN NATIVE MULTILINE WIDGET
 * ---------------------------------------------------------
 */
function setMultilineWidgetHeight(
    widget,
    height
) {
    if (!widget) {
        return;
    }

    widget.computeSize =
        (width) => [
            width,
            height,
        ];

    if (widget.element) {
        widget.element.style.height =
            `${height}px`;

        widget.element.style.minHeight =
            `${height}px`;

        widget.element.style.maxHeight =
            `${height}px`;
    }

    if (widget.inputEl) {
        widget.inputEl.style.height =
            `${height}px`;

        widget.inputEl.style.minHeight =
            `${height}px`;

        widget.inputEl.style.maxHeight =
            `${height}px`;
    }
}


/*
 * ---------------------------------------------------------
 * HIDE BACKEND WIDGET
 * ---------------------------------------------------------
 *
 * Keep the widget alive and serialized, but remove
 * the normal ComfyUI visual control.
 */
function hideBackendWidget(widget) {
    if (!widget) {
        return;
    }

    widget.serialize =
        true;

    widget.options ??=
        {};

    widget.options.serialize =
        true;

    widget.type =
        "converted-widget";

    widget.computeSize =
        () => [
            0,
            -4,
        ];

    widget.draw =
        () => {};

    widget.mouse =
        () => false;

    if (widget.element) {
        widget.element.style.display =
            "none";
    }

    if (widget.inputEl) {
        widget.inputEl.style.display =
            "none";
    }
}


function getThumbnailUrl(
    library,
    name,
    extension
) {
    const filename =
        `${slugify(name)}.${extension}`;

    return (
        `${THUMBNAIL_ROOT}/${library}/` +
        encodeURIComponent(
            filename
        ) +
        `?v=${THUMBNAIL_CACHE_VERSION}`
    );
}


function applyStyles(
    element,
    styles
) {
    Object.assign(
        element.style,
        styles
    );

    return element;
}


/*
 * ---------------------------------------------------------
 * SELECTED PRESET CARD
 * ---------------------------------------------------------
 */
function createSelectedPresetCard(
    sectionLabel
) {
    const container =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                display:
                    "flex",

                width:
                    "100%",

                height:
                    "62px",

                minHeight:
                    "62px",

                boxSizing:
                    "border-box",

                border:
                    "1px solid rgba(255,255,255,0.16)",

                borderRadius:
                    "7px",

                overflow:
                    "hidden",

                background:
                    "#1c1c20",
            }
        );


    /*
     * Thumbnail area
     */
    const imageArea =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                width:
                    "82px",

                minWidth:
                    "82px",

                height:
                    "62px",

                position:
                    "relative",

                overflow:
                    "hidden",

                background:
                    "#34343a",
            }
        );


    const image =
        applyStyles(
            document.createElement(
                "img"
            ),
            {
                width:
                    "100%",

                height:
                    "100%",

                objectFit:
                    "cover",

                display:
                    "none",
            }
        );

    image.draggable =
        false;


    const fallback =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "absolute",

                inset:
                    "0",

                display:
                    "flex",

                alignItems:
                    "center",

                justifyContent:
                    "center",

                padding:
                    "5px",

                boxSizing:
                    "border-box",

                textAlign:
                    "center",

                fontSize:
                    "10px",

                fontWeight:
                    "600",

                color:
                    "rgba(255,255,255,0.62)",
            }
        );

    fallback.textContent =
        "No Preset";


    imageArea.append(
        image,
        fallback
    );


    /*
     * Text area
     */
    const textArea =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                flex:
                    "1",

                minWidth:
                    "0",

                display:
                    "flex",

                flexDirection:
                    "column",

                justifyContent:
                    "center",

                padding:
                    "6px 9px",

                boxSizing:
                    "border-box",
            }
        );


    const label =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                fontSize:
                    "9px",

                fontWeight:
                    "600",

                color:
                    "rgba(255,255,255,0.50)",

                marginBottom:
                    "3px",

                letterSpacing:
                    "0.03em",

                whiteSpace:
                    "nowrap",

                overflow:
                    "hidden",

                textOverflow:
                    "ellipsis",
            }
        );

    label.textContent =
        sectionLabel.toUpperCase();


    const title =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                fontSize:
                    "12px",

                fontWeight:
                    "700",

                color:
                    "#f2f2f2",

                whiteSpace:
                    "normal",

                overflow:
                    "hidden",

                lineHeight:
                    "1.15",

                maxHeight:
                    "29px",
            }
        );

    title.textContent =
        "No Preset";


    textArea.append(
        label,
        title
    );


    container.append(
        imageArea,
        textArea
    );


    return {
        container,
        image,
        fallback,
        title,

        currentPreset:
            null,

        requestToken:
            null,
    };
}


function setSelectedPresetCard(
    node,
    card,
    libraryKey,
    presetName
) {
    if (!card) {
        return;
    }

    const name =
        presetName ||
        "No Preset";


    if (
        card.currentPreset ===
        name
    ) {
        return;
    }


    card.currentPreset =
        name;

    card.title.textContent =
        name;

    card.image.style.display =
        "none";

    card.fallback.style.display =
        "flex";


    if (
        name ===
        "No Preset"
    ) {
        card.requestToken =
            null;

        card.fallback.textContent =
            "No Preset";

        return;
    }


    card.fallback.textContent =
        "Loading...";


    let extensionIndex =
        0;


    const requestToken =
        `${libraryKey}:${name}:${Date.now()}`;


    card.requestToken =
        requestToken;


    const tryNext =
        () => {

        if (
            card.requestToken !==
            requestToken
        ) {
            return;
        }


        if (
            extensionIndex >=
            THUMBNAIL_EXTENSIONS.length
        ) {
            card.image.style.display =
                "none";

            card.fallback.style.display =
                "flex";

            card.fallback.textContent =
                "No Image";

            return;
        }


        const extension =
            THUMBNAIL_EXTENSIONS[
                extensionIndex++
            ];


        card.image.src =
            getThumbnailUrl(
                libraryKey,
                name,
                extension
            );
    };


    card.image.onload =
        () => {

        if (
            card.requestToken !==
            requestToken
        ) {
            return;
        }


        card.fallback.style.display =
            "none";

        card.image.style.display =
            "block";
    };


    card.image.onerror =
        tryNext;


    tryNext();


    node.setDirtyCanvas?.(
        true,
        true
    );


    app.graph?.setDirtyCanvas?.(
        true,
        true
    );
}


/*
 * ---------------------------------------------------------
 * BROWSE BUTTON
 * ---------------------------------------------------------
 */
function createBrowseButton(
    label,
    callback
) {
    const button =
        applyStyles(
            document.createElement(
                "button"
            ),
            {
                width:
                    "100%",

                height:
                    "24px",

                minHeight:
                    "24px",

                boxSizing:
                    "border-box",

                border:
                    "1px solid rgba(255,255,255,0.14)",

                borderRadius:
                    "5px",

                background:
                    "#34343b",

                color:
                    "#f2f2f2",

                fontSize:
                    "10px",

                fontWeight:
                    "600",

                cursor:
                    "pointer",

                padding:
                    "0 6px",

                lineHeight:
                    "22px",

                whiteSpace:
                    "nowrap",

                overflow:
                    "hidden",

                textOverflow:
                    "ellipsis",
            }
        );


    button.type =
        "button";

    button.textContent =
        label;


    button.addEventListener(
        "mouseenter",
        () => {

            button.style.background =
                "#414149";
        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            button.style.background =
                "#34343b";
        }
    );


    button.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            callback();
        }
    );


    return button;
}


/*
 * ---------------------------------------------------------
 * ONE PRESET LIBRARY SECTION
 * ---------------------------------------------------------
 */
function createLibrarySection(
    node,
    libraryKey,
    widgetName,
    sectionLabel,
    browseLabel
) {
    const wrapper =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                display:
                    "flex",

                flexDirection:
                    "column",

                gap:
                    "3px",

                width:
                    "100%",

                minWidth:
                    "0",

                flex:
                    "0 0 auto",
            }
        );


    const card =
        createSelectedPresetCard(
            sectionLabel
        );


    const button =
        createBrowseButton(
            browseLabel,

            () =>
                openGallery(
                    node,
                    libraryKey,
                    widgetName
                )
        );


    wrapper.append(
        card.container,
        button
    );


    return {
        wrapper,
        card,
        button,
    };
}


/*
 * ---------------------------------------------------------
 * COMPLETE PROMPT STUDIO PANEL
 * ---------------------------------------------------------
 *
 * LEFT:
 *   Look & Feel
 *   Lighting
 *   Camera
 *
 * RIGHT:
 *   Created Prompt
 *
 * BOTTOM:
 *   Prompt Suffix
 */
function createPromptStudioPanel(
    node,
    suffixWidget
) {
    const root =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                width:
                    "100%",

                height:
                    "600px",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                display:
                    "flex",

                flexDirection:
                    "column",

                gap:
                    "8px",

                padding:
                    "2px",

                overflow:
                    "hidden",
            }
        );


    /*
     * -------------------------------------------------
     * TOP AREA
     * -------------------------------------------------
     */
    const topArea =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                flex:
                    "1 1 auto",

                minHeight:
                    "0",

                minWidth:
                    "0",

                display:
                    "grid",

                gridTemplateColumns:
                    "minmax(0, 2fr) minmax(0, 3fr)",

                gap:
                    "8px",

                width:
                    "100%",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                overflow:
                    "hidden",
            }
        );


    /*
     * -------------------------------------------------
     * LEFT COLUMN
     * -------------------------------------------------
     */
    const libraryColumn =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                display:
                    "flex",

                flexDirection:
                    "column",

                gap:
                    "6px",

                minWidth:
                    "0",

                width:
                    "100%",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                overflow:
                    "hidden",
            }
        );


    const lookAndFeel =
        createLibrarySection(
            node,

            "look_and_feel",

            "look_and_feel",

            "Look & Feel",

            "Browse Look & Feel Library"
        );


    const lighting =
        createLibrarySection(
            node,

            "lighting",

            "lighting",

            "Lighting",

            "Browse Lighting Library"
        );


    const camera =
        createLibrarySection(
            node,

            "camera",

            "camera",

            "Camera",

            "Browse Camera Library"
        );


    const creativeEnhancements =
        createLibrarySection(
            node,

            "creative_enhancements",

            "creative_enhancement",

            "Creative Enhancements",

            "Browse Creative Enhancements"
        );


    libraryColumn.append(
        lookAndFeel.wrapper,
        lighting.wrapper,
        camera.wrapper,
        creativeEnhancements.wrapper
    );


    /*
     * -------------------------------------------------
     * RIGHT COLUMN - CREATED PROMPT
     * -------------------------------------------------
     */
    const promptColumn =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                minWidth:
                    "0",

                minHeight:
                    "0",

                width:
                    "100%",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                display:
                    "flex",

                flexDirection:
                    "column",

                overflow:
                    "hidden",

                border:
                    "1px solid rgba(255,255,255,0.16)",

                borderRadius:
                    "7px",

                background:
                    "#1c1c20",
            }
        );


    const promptHeader =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                flex:
                    "0 0 auto",

                padding:
                    "7px 10px",

                borderBottom:
                    "1px solid rgba(255,255,255,0.10)",

                fontSize:
                    "10px",

                fontWeight:
                    "700",

                color:
                    "rgba(255,255,255,0.68)",

                letterSpacing:
                    "0.03em",

                boxSizing:
                    "border-box",
            }
        );


    promptHeader.textContent =
        "CREATED PROMPT";


    const promptTextarea =
        applyStyles(
            document.createElement(
                "textarea"
            ),
            {
                flex:
                    "1 1 auto",

                width:
                    "100%",

                maxWidth:
                    "100%",

                minWidth:
                    "0",

                minHeight:
                    "0",

                boxSizing:
                    "border-box",

                resize:
                    "none",

                border:
                    "0",

                outline:
                    "none",

                padding:
                    "10px 12px",

                background:
                    "#222227",

                color:
                    "#f2f2f2",

                fontFamily:
                    "inherit",

                fontSize:
                    "12px",

                lineHeight:
                    "1.45",

                overflowX:
                    "hidden",

                overflowY:
                    "auto",

                whiteSpace:
                    "pre-wrap",

                wordBreak:
                    "break-word",

                overflowWrap:
                    "anywhere",
            }
        );


    promptTextarea.readOnly =
        true;


    promptTextarea.spellcheck =
        false;


    promptTextarea.placeholder =
        "Your created prompt will appear here...";


    promptColumn.append(
        promptHeader,
        promptTextarea
    );


    topArea.append(
        libraryColumn,
        promptColumn
    );


    /*
     * -------------------------------------------------
     * BOTTOM - PROMPT SUFFIX
     * -------------------------------------------------
     */
    const suffixArea =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                flex:
                    "0 0 105px",

                minHeight:
                    "105px",

                width:
                    "100%",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                display:
                    "flex",

                flexDirection:
                    "column",

                overflow:
                    "hidden",

                border:
                    "1px solid rgba(255,255,255,0.16)",

                borderRadius:
                    "7px",

                background:
                    "#1c1c20",
            }
        );


    const suffixHeader =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                flex:
                    "0 0 auto",

                padding:
                    "6px 9px",

                borderBottom:
                    "1px solid rgba(255,255,255,0.10)",

                fontSize:
                    "10px",

                fontWeight:
                    "600",

                color:
                    "rgba(255,255,255,0.64)",

                letterSpacing:
                    "0.02em",

                boxSizing:
                    "border-box",
            }
        );


    suffixHeader.textContent =
        "PROMPT SUFFIX";


    const suffixTextarea =
        applyStyles(
            document.createElement(
                "textarea"
            ),
            {
                flex:
                    "1 1 auto",

                width:
                    "100%",

                maxWidth:
                    "100%",

                minWidth:
                    "0",

                minHeight:
                    "0",

                boxSizing:
                    "border-box",

                resize:
                    "none",

                border:
                    "0",

                outline:
                    "none",

                padding:
                    "8px 10px",

                background:
                    "#222227",

                color:
                    "#f2f2f2",

                fontFamily:
                    "inherit",

                fontSize:
                    "12px",

                lineHeight:
                    "1.35",

                overflowX:
                    "hidden",

                overflowY:
                    "auto",

                wordBreak:
                    "break-word",

                overflowWrap:
                    "anywhere",
            }
        );


    suffixTextarea.placeholder =
        "Optional prompt suffix...";


    suffixTextarea.spellcheck =
        false;


    suffixTextarea.value =
        suffixWidget?.value ??
        "";


    /*
     * Keep the real hidden prompt_suffix widget
     * synchronized with our visible textarea.
     */
    suffixTextarea.addEventListener(
        "input",
        () => {

            if (!suffixWidget) {
                return;
            }


            suffixWidget.value =
                suffixTextarea.value;


            suffixWidget.callback?.(
                suffixTextarea.value
            );


            updateLivePreview(
                node
            );
        }
    );


    suffixArea.append(
        suffixHeader,
        suffixTextarea
    );


    root.append(
        topArea,
        suffixArea
    );


    /*
     * Add exactly one DOM widget.
     */
    const widget =
        node.addDOMWidget(
            "prompt_studio_panel",

            "prompt_studio_panel",

            root,

            {
                serialize:
                    false,

                hideOnZoom:
                    false,
            }
        );


    /*
     * Explicit size for the DOM widget.
     */
    widget.computeSize =
        (width) => [
            width,
            610,
        ];


    return {
        widget,
        root,

        promptTextarea,
        suffixTextarea,

        styleCard:
            lookAndFeel.card,

        lightingCard:
            lighting.card,

        cameraCard:
            camera.card,

        enhancementCard:
            creativeEnhancements.card,
    };
}


function setCreatedPrompt(
    node,
    value
) {
    if (
        !node.ucnPromptTextarea
    ) {
        return;
    }


    node.ucnPromptTextarea.value =
        value ?? "";
}


/*
 * ---------------------------------------------------------
 * SYNC PROMPT SUFFIX
 * ---------------------------------------------------------
 */
function syncSuffixFromBackend(node) {
    if (
        !node.ucnSuffixTextarea
    ) {
        return;
    }


    const widget =
        findWidget(
            node,
            "prompt_suffix"
        );


    if (!widget) {
        return;
    }


    const value =
        String(
            widget.value ??
            ""
        );


    if (
        node.ucnSuffixTextarea.value !==
        value
    ) {
        node.ucnSuffixTextarea.value =
            value;
    }
}


/*
 * ---------------------------------------------------------
 * LIVE PROMPT PREVIEW
 * ---------------------------------------------------------
 */
function updateLivePreview(node) {
    if (!presetCache) {
        return;
    }


    const prefix =
        findWidget(
            node,
            "prompt_prefix"
        )?.value ??
        "";


    const content =
        findWidget(
            node,
            "main_prompt_content"
        )?.value ??
        "";


    const styleName =
        findWidget(
            node,
            "look_and_feel"
        )?.value ??
        "No Preset";


    const lightingName =
        findWidget(
            node,
            "lighting"
        )?.value ??
        "No Preset";


    const cameraName =
        findWidget(
            node,
            "camera"
        )?.value ??
        "No Preset";


    const enhancementName =
        findWidget(
            node,
            "creative_enhancement"
        )?.value ??
        "No Preset";


    const suffix =
        findWidget(
            node,
            "prompt_suffix"
        )?.value ??
        "";


    const styleText =
        styleName ===
        "No Preset"

            ? ""

            : (
                presetCache
                    .look_and_feel
                    ?.[styleName] ??
                ""
            );


    const lightingText =
        lightingName ===
        "No Preset"

            ? ""

            : (
                presetCache
                    .lighting
                    ?.[lightingName] ??
                ""
            );


    const cameraText =
        cameraName ===
        "No Preset"

            ? ""

            : (
                presetCache
                    .camera
                    ?.[cameraName] ??
                ""
            );


    const enhancementText =
        enhancementName ===
        "No Preset"

            ? ""

            : (
                presetCache
                    .creative_enhancements
                    ?.[enhancementName] ??
                ""
            );


    setSelectedPresetCard(
        node,
        node.ucnStyleCard,
        "look_and_feel",
        styleName
    );


    setSelectedPresetCard(
        node,
        node.ucnLightingCard,
        "lighting",
        lightingName
    );


    setSelectedPresetCard(
        node,
        node.ucnCameraCard,
        "camera",
        cameraName
    );


    setSelectedPresetCard(
        node,
        node.ucnEnhancementCard,
        "creative_enhancements",
        enhancementName
    );


    const combined =
        joinParts([
            prefix,
            content,
            styleText,
            lightingText,
            cameraText,
            enhancementText,
            suffix,
        ]);


    setCreatedPrompt(
        node,
        combined
    );


    syncSuffixFromBackend(
        node
    );


    node.setDirtyCanvas?.(
        true,
        true
    );


    app.graph?.setDirtyCanvas?.(
        true,
        true
    );
}


/*
 * ---------------------------------------------------------
 * GALLERY CSS
 * ---------------------------------------------------------
 */
function ensureGalleryStyles() {
    if (
        document.getElementById(
            "ucn-prompt-studio-gallery-styles"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "ucn-prompt-studio-gallery-styles";


    style.textContent = `

        .ucn-gallery-overlay {
            position: fixed;
            inset: 0;
            z-index: 100000;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 24px;

            background:
                rgba(
                    0,
                    0,
                    0,
                    0.76
                );

            backdrop-filter:
                blur(4px);
        }


        .ucn-gallery-modal {
            width:
                min(
                    1180px,
                    calc(
                        100vw - 48px
                    )
                );

            max-height:
                calc(
                    100vh - 48px
                );

            display:
                flex;

            flex-direction:
                column;

            overflow:
                hidden;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.14
                );

            border-radius:
                14px;

            background:
                #1b1b1f;

            color:
                #f3f3f3;

            box-shadow:
                0 24px 80px
                rgba(
                    0,
                    0,
                    0,
                    0.55
                );
        }


        .ucn-gallery-header {
            display:
                flex;

            gap:
                14px;

            align-items:
                center;

            padding:
                16px 18px 12px;
        }


        .ucn-gallery-title {
            flex:
                1;

            min-width:
                180px;

            font-size:
                18px;

            font-weight:
                700;
        }


        .ucn-gallery-search {
            width:
                min(
                    360px,
                    40vw
                );

            padding:
                9px 11px;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.15
                );

            border-radius:
                8px;

            outline:
                none;

            background:
                #29292f;

            color:
                #f3f3f3;
        }


        .ucn-gallery-close {
            border:
                0;

            border-radius:
                8px;

            padding:
                8px 12px;

            cursor:
                pointer;

            background:
                #34343b;

            color:
                #ffffff;
        }


        .ucn-gallery-tabs {
            display:
                flex;

            gap:
                8px;

            flex-wrap:
                wrap;

            padding:
                0 18px 14px;

            border-bottom:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.10
                );
        }


        .ucn-gallery-tab {
            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.12
                );

            border-radius:
                999px;

            padding:
                7px 12px;

            cursor:
                pointer;

            background:
                #29292f;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.76
                );

            font-size:
                12px;

            font-weight:
                650;
        }


        .ucn-gallery-tab:hover {
            border-color:
                rgba(
                    255,
                    255,
                    255,
                    0.30
                );

            color:
                #ffffff;
        }


        .ucn-gallery-tab.is-active {
            background:
                #3b3b45;

            border-color:
                #74b9ff;

            color:
                #ffffff;

            box-shadow:
                0 0 0 1px
                rgba(
                    116,
                    185,
                    255,
                    0.18
                );
        }


        .ucn-gallery-grid {
            display:
                grid;

            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(
                        190px,
                        1fr
                    )
                );

            gap:
                14px;

            overflow:
                auto;

            padding:
                18px;
        }


        .ucn-gallery-card {
            overflow:
                hidden;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.12
                );

            border-radius:
                10px;

            cursor:
                pointer;

            background:
                #242429;
        }


        .ucn-gallery-card:hover {
            border-color:
                rgba(
                    255,
                    255,
                    255,
                    0.34
                );

            background:
                #2b2b31;

            transform:
                translateY(
                    -2px
                );
        }


        .ucn-gallery-card.is-selected {
            border-color:
                #74b9ff;

            box-shadow:
                0 0 0 2px
                rgba(
                    116,
                    185,
                    255,
                    0.22
                );
        }


        .ucn-gallery-image-wrap {
            width:
                100%;

            aspect-ratio:
                4 / 3;

            overflow:
                hidden;

            background:
                linear-gradient(
                    135deg,
                    rgba(
                        255,
                        255,
                        255,
                        0.045
                    ),
                    rgba(
                        255,
                        255,
                        255,
                        0.012
                    )
                );
        }


        .ucn-gallery-image {
            display:
                block;

            width:
                100%;

            height:
                100%;

            object-fit:
                cover;
        }


        .ucn-gallery-fallback {
            box-sizing:
                border-box;

            width:
                100%;

            height:
                100%;

            display:
                flex;

            flex-direction:
                column;

            align-items:
                center;

            justify-content:
                center;

            gap:
                7px;

            padding:
                16px;

            text-align:
                center;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.74
                );
        }


        .ucn-gallery-fallback-sub {
            font-size:
                12px;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.46
                );
        }


        .ucn-gallery-label {
            min-height:
                42px;

            display:
                flex;

            align-items:
                center;

            padding:
                9px 11px;

            font-size:
                13px;

            font-weight:
                600;

            line-height:
                1.25;
        }


        .ucn-gallery-empty {
            grid-column:
                1 / -1;

            padding:
                40px;

            text-align:
                center;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.62
                );
        }

    `;


    document.head.appendChild(
        style
    );
}


/*
 * ---------------------------------------------------------
 * GALLERY FALLBACK
 * ---------------------------------------------------------
 */
function makeFallback(name) {
    const element =
        document.createElement(
            "div"
        );


    element.className =
        "ucn-gallery-fallback";


    const title =
        document.createElement(
            "div"
        );


    title.textContent =
        name;


    const subtitle =
        document.createElement(
            "div"
        );


    subtitle.className =
        "ucn-gallery-fallback-sub";


    subtitle.textContent =
        name ===
        "No Preset"

            ? "Remove the selected preset"

            : "No sample image";


    element.append(
        title,
        subtitle
    );


    return element;
}


/*
 * ---------------------------------------------------------
 * GALLERY THUMBNAIL
 * ---------------------------------------------------------
 */
function makeThumbnail(
    library,
    name
) {
    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "ucn-gallery-image-wrap";


    if (
        name ===
        "No Preset"
    ) {
        wrapper.appendChild(
            makeFallback(
                name
            )
        );

        return wrapper;
    }


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "ucn-gallery-image";


    image.alt =
        `${name} sample`;


    image.loading =
        "lazy";


    image.draggable =
        false;


    let index =
        0;


    const tryNext =
        () => {

        if (
            index >=
            THUMBNAIL_EXTENSIONS.length
        ) {
            image.remove();

            wrapper.appendChild(
                makeFallback(
                    name
                )
            );

            return;
        }


        image.src =
            getThumbnailUrl(
                library,
                name,
                THUMBNAIL_EXTENSIONS[
                    index++
                ]
            );
    };


    image.onerror =
        tryNext;


    image.onload =
        () => {

        image.onerror =
            null;
    };


    wrapper.appendChild(
        image
    );


    tryNext();


    return wrapper;
}


/*
 * ---------------------------------------------------------
 * OPEN PRESET GALLERY
 * ---------------------------------------------------------
 */
async function openGallery(
    node,
    libraryKey,
    widgetName
) {
    ensureGalleryStyles();


    const presets =
        await loadPresets();


    const config =
        LIBRARY_CONFIG[
            libraryKey
        ];


    const names = [
        "No Preset",

        ...Object.keys(
            presets[
                libraryKey
            ] ?? {}
        ),
    ];


    const targetWidget =
        findWidget(
            node,
            widgetName
        );


    if (
        !targetWidget ||
        !config
    ) {
        return;
    }


    let activeCategory =
        "All";


    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "ucn-gallery-overlay";


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "ucn-gallery-modal";


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "ucn-gallery-header";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "ucn-gallery-title";


    title.textContent =
        config.title;


    const search =
        document.createElement(
            "input"
        );


    search.className =
        "ucn-gallery-search";


    search.type =
        "search";


    search.placeholder =
        config.search;


    const close =
        document.createElement(
            "button"
        );


    close.className =
        "ucn-gallery-close";


    close.type =
        "button";


    close.textContent =
        "Close";


    const tabs =
        document.createElement(
            "div"
        );


    tabs.className =
        "ucn-gallery-tabs";


    const grid =
        document.createElement(
            "div"
        );


    grid.className =
        "ucn-gallery-grid";


    const dismiss =
        () => {

        document.removeEventListener(
            "keydown",
            onKeyDown
        );


        overlay.remove();
    };


    const onKeyDown =
        (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            dismiss();
        }
    };


    document.addEventListener(
        "keydown",
        onKeyDown
    );


    close.addEventListener(
        "click",
        dismiss
    );


    overlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                overlay
            ) {

                dismiss();
            }
        }
    );


    const render =
        () => {

        const query =
            search.value
                .trim()
                .toLowerCase();


        grid.replaceChildren();


        const filtered =
            names.filter(
                (name) => {

                    if (
                        !name
                            .toLowerCase()
                            .includes(
                                query
                            )
                    ) {

                        return false;
                    }


                    if (
                        activeCategory ===
                        "All"
                    ) {

                        return true;
                    }


                    if (
                        name ===
                        "No Preset"
                    ) {

                        return false;
                    }


                    return (
                        (
                            config.categories[
                                name
                            ] ??
                            config.defaultCategory
                        ) ===
                        activeCategory
                    );
                }
            );


        if (
            !filtered.length
        ) {
            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "ucn-gallery-empty";


            empty.textContent =
                "No matching presets.";


            grid.appendChild(
                empty
            );


            return;
        }


        for (
            const name
            of filtered
        ) {
            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "ucn-gallery-card";


            if (
                targetWidget.value ===
                name
            ) {

                card.classList.add(
                    "is-selected"
                );
            }


            card.appendChild(
                makeThumbnail(
                    libraryKey,
                    name
                )
            );


            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "ucn-gallery-label";


            label.textContent =
                name;


            card.appendChild(
                label
            );


            card.addEventListener(
                "click",
                () => {

                    targetWidget.value =
                        name;


                    targetWidget.callback?.(
                        name
                    );


                    updateLivePreview(
                        node
                    );


                    dismiss();
                }
            );


            grid.appendChild(
                card
            );
        }
    };


    for (
        const category
        of config.tabs
    ) {
        const tab =
            document.createElement(
                "button"
            );


        tab.type =
            "button";


        tab.className =
            "ucn-gallery-tab";


        tab.textContent =
            category;


        if (
            category ===
            activeCategory
        ) {

            tab.classList.add(
                "is-active"
            );
        }


        tab.addEventListener(
            "click",
            () => {

                activeCategory =
                    category;


                for (
                    const child
                    of tabs.children
                ) {

                    child.classList.toggle(
                        "is-active",
                        child ===
                            tab
                    );
                }


                render();
            }
        );


        tabs.appendChild(
            tab
        );
    }


    search.addEventListener(
        "input",
        render
    );


    header.append(
        title,
        search,
        close
    );


    modal.append(
        header,
        tabs,
        grid
    );


    overlay.appendChild(
        modal
    );


    document.body.appendChild(
        overlay
    );


    render();


    requestAnimationFrame(
        () => {

            search.focus();
        }
    );
}


/*
 * ---------------------------------------------------------
 * COMFYUI EXTENSION
 * ---------------------------------------------------------
 */
app.registerExtension({
    name:
        "UncladComfyNodes.UncladPromptStudio",


    async beforeRegisterNodeDef(
        nodeType,
        nodeData
    ) {
        if (
            nodeData.name !==
            TARGET_NODE
        ) {
            return;
        }


        const originalOnNodeCreated =
            nodeType.prototype
                .onNodeCreated;


        const originalOnExecuted =
            nodeType.prototype
                .onExecuted;


        nodeType.prototype.onNodeCreated =
            function () {

                originalOnNodeCreated
                    ?.apply(
                        this,
                        arguments
                    );


                const node =
                    this;


                /*
                 * -------------------------------------------------
                 * REAL BACKEND WIDGETS
                 * -------------------------------------------------
                 */
                const prefixWidget =
                    findWidget(
                        node,
                        "prompt_prefix"
                    );


                const lookWidget =
                    findWidget(
                        node,
                        "look_and_feel"
                    );


                const lightingWidget =
                    findWidget(
                        node,
                        "lighting"
                    );


                const cameraWidget =
                    findWidget(
                        node,
                        "camera"
                    );


                const enhancementWidget =
                    findWidget(
                        node,
                        "creative_enhancement"
                    );


                const suffixWidget =
                    findWidget(
                        node,
                        "prompt_suffix"
                    );


                /*
                 * -------------------------------------------------
                 * SHORTEN PROMPT PREFIX
                 * -------------------------------------------------
                 *
                 * Keep Main Prompt Content unchanged.
                 */
                setMultilineWidgetHeight(
                    prefixWidget,
                    105
                );


                /*
                 * -------------------------------------------------
                 * HIDE PRESET DROPDOWNS + ORIGINAL SUFFIX
                 * -------------------------------------------------
                 *
                 * All remain real backend widgets.
                 */
                hideBackendWidget(
                    lookWidget
                );


                hideBackendWidget(
                    lightingWidget
                );


                hideBackendWidget(
                    cameraWidget
                );


                hideBackendWidget(
                    enhancementWidget
                );


                hideBackendWidget(
                    suffixWidget
                );


                /*
                 * -------------------------------------------------
                 * ADD OUR CUSTOM PANEL
                 * -------------------------------------------------
                 */
                const panel =
                    createPromptStudioPanel(
                        node,
                        suffixWidget
                    );


                node.ucnPromptPanel =
                    panel.widget;


                node.ucnPromptTextarea =
                    panel.promptTextarea;


                node.ucnSuffixTextarea =
                    panel.suffixTextarea;


                node.ucnStyleCard =
                    panel.styleCard;


                node.ucnLightingCard =
                    panel.lightingCard;


                node.ucnCameraCard =
                    panel.cameraCard;


                node.ucnEnhancementCard =
                    panel.enhancementCard;


                /*
                 * -------------------------------------------------
                 * LOAD PRESET DATA
                 * -------------------------------------------------
                 */
                loadPresets()

                    .then(
                        () => {

                            const watched = [
                                "prompt_prefix",
                                "main_prompt_content",
                                "look_and_feel",
                                "lighting",
                                "camera",
                                "creative_enhancement",
                                "prompt_suffix",
                            ];


                            for (
                                const name
                                of watched
                            ) {

                                const widget =
                                    findWidget(
                                        node,
                                        name
                                    );


                                if (
                                    !widget
                                ) {

                                    continue;
                                }


                                const originalCallback =
                                    widget.callback;


                                widget.callback =
                                    function () {

                                        originalCallback
                                            ?.apply(
                                                this,
                                                arguments
                                            );


                                        updateLivePreview(
                                            node
                                        );
                                    };
                            }


                            /*
                             * Existing workflows may already
                             * contain a Prompt Suffix value.
                             */
                            syncSuffixFromBackend(
                                node
                            );


                            updateLivePreview(
                                node
                            );
                        }
                    )

                    .catch(
                        (error) => {

                            console.error(
                                "[Unclad Comfy Nodes] Could not load Prompt Studio presets",
                                error
                            );
                        }
                    );


                /*
                 * -------------------------------------------------
                 * NODE SIZE
                 * -------------------------------------------------
                 */
                const resizeNode =
                    () => {

                        node.setSize?.([
                            Math.max(
                                node.size?.[0] ??
                                    940,

                                940
                            ),

                            Math.max(
                                node.size?.[1] ??
                                    980,

                                980
                            ),
                        ]);


                        node.setDirtyCanvas?.(
                            true,
                            true
                        );


                        app.graph?.setDirtyCanvas?.(
                            true,
                            true
                        );
                    };


                /*
                 * Initial resize.
                 */
                resizeNode();


                /*
                 * DOM widgets do not always have their final
                 * dimensions during onNodeCreated, so resize
                 * again on the next browser frame.
                 */
                requestAnimationFrame(
                    () => {

                        resizeNode();
                    }
                );
            };


        /*
         * -------------------------------------------------
         * AFTER WORKFLOW EXECUTION
         * -------------------------------------------------
         */
        nodeType.prototype.onExecuted =
            function (
                message
            ) {

                originalOnExecuted
                    ?.apply(
                        this,
                        arguments
                    );


                updateLivePreview(
                    this
                );


                /*
                 * Prefer the exact prompt returned by
                 * the Python backend after execution.
                 */
                const backendPrompt =
                    message
                        ?.combined_text
                        ?.[0];


                if (
                    backendPrompt !==
                    undefined
                ) {

                    setCreatedPrompt(
                        this,
                        backendPrompt
                    );
                }


                this.setDirtyCanvas?.(
                    true,
                    true
                );
            };
    },
});