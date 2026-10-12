import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";


const TARGET_NODE =
    "UCNImagePreview";

const SAVE_ENDPOINT =
    "/unclad-comfy-nodes/image-preview/save";


/*
 * =========================================================
 * General helpers
 * =========================================================
 */

function firstValue(value) {
    if (
        Array.isArray(value)
    ) {
        return value[0];
    }

    return value;
}


function normalizeEntries(value) {
    if (
        !Array.isArray(value)
    ) {
        return [];
    }

    return value.filter(
        (entry) =>
            entry &&
            typeof entry === "object" &&
            entry.filename
    );
}


function previewUrl(entry) {
    if (!entry) {
        return "";
    }

    const params =
        new URLSearchParams({
            filename:
                entry.filename,

            subfolder:
                entry.subfolder ?? "",

            type:
                entry.type ?? "temp",
        });


    const path =
        `/view?${params.toString()}`;


    if (
        typeof api.apiURL ===
        "function"
    ) {
        return api.apiURL(
            path
        );
    }

    return path;
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
 * =========================================================
 * Compare position
 * =========================================================
 *
 * 0   = all Image B
 * 50  = half A / half B
 * 100 = all Image A
 *
 * Image A is shown on the LEFT.
 * Image B is shown on the RIGHT.
 */

function setComparePosition(
    node,
    percent
) {
    const ui =
        node.ucCompareUI;

    if (!ui) {
        return;
    }


    const value =
        Math.max(
            0,
            Math.min(
                100,
                Number(percent)
            )
        );


    ui.comparePercent =
        value;


    ui.slider.value =
        String(value);


    /*
     * Image A is clipped so it fills
     * from the left edge to the divider.
     */
    ui.imageAClip.style.clipPath =
        `inset(0 ${100 - value}% 0 0)`;


    ui.divider.style.left =
        `${value}%`;
}


/*
 * =========================================================
 * Panel sizing
 * =========================================================
 */

function getCompareDimensions(node) {
    const nodeWidth =
        Math.max(
            node.size?.[0] ?? 620,
            620
        );


    /*
     * Leave room for ComfyUI's internal margins.
     */
    const usableWidth =
        Math.max(
            nodeWidth - 24,
            596
        );


    /*
     * Viewer gets taller as node gets wider,
     * but don't let it become enormous.
     */
    const viewerHeight =
        Math.max(
            360,
            Math.min(
                650,
                Math.round(
                    usableWidth * 0.62
                )
            )
        );


    /*
     * Viewer
     * + slider
     * + buttons
     * + gaps/padding
     */
    const compareWidgetHeight =
        viewerHeight + 86;


    return {
        usableWidth,
        viewerHeight,
        compareWidgetHeight,
    };
}


function syncComparePanelSize(node) {
    if (
        !node ||
        !node.ucCompareUI
    ) {
        return;
    }


    const ui =
        node.ucCompareUI;


    const {
        usableWidth,
        viewerHeight,
        compareWidgetHeight,
    } = getCompareDimensions(
        node
    );


    ui.root.style.width =
        `${usableWidth}px`;

    ui.root.style.maxWidth =
        `${usableWidth}px`;


    ui.compareArea.style.width =
        `${usableWidth}px`;

    ui.compareArea.style.maxWidth =
        `${usableWidth}px`;


    ui.viewer.style.width =
        `${usableWidth}px`;

    ui.viewer.style.height =
        `${viewerHeight}px`;


    if (
        node.ucHasImageB
    ) {
        ui.root.style.height =
            `${compareWidgetHeight}px`;

        ui.widget.computeSize =
            () => [
                usableWidth,
                compareWidgetHeight,
            ];

    } else {
        /*
         * Only the single Save Image A
         * button is needed below the native
         * ComfyUI preview.
         */
        ui.root.style.height =
            "40px";

        ui.widget.computeSize =
            () => [
                usableWidth,
                40,
            ];
    }


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
 * =========================================================
 * Node size refresh
 * =========================================================
 */

function refreshNodeSize(node) {
    if (!node) {
        return;
    }


    const computed =
        node.computeSize?.();


    if (
        Array.isArray(computed) &&
        computed.length >= 2
    ) {
        node.setSize?.([
            Math.max(
                node.size?.[0] ?? 620,
                computed[0] ?? 620,
                node.ucHasImageB
                    ? 620
                    : 420
            ),

            Math.max(
                node.size?.[1] ?? 300,
                computed[1] ?? 300
            ),
        ]);
    }


    node.setDirtyCanvas?.(
        true,
        true
    );


    app.graph?.setDirtyCanvas?.(
        true,
        true
    );
}


function delayedRefresh(node) {
    syncComparePanelSize(
        node
    );

    refreshNodeSize(
        node
    );


    requestAnimationFrame(
        () => {

            syncComparePanelSize(
                node
            );

            refreshNodeSize(
                node
            );


            requestAnimationFrame(
                () => {

                    syncComparePanelSize(
                        node
                    );

                    refreshNodeSize(
                        node
                    );
                }
            );
        }
    );
}


/*
 * =========================================================
 * Save helper
 * =========================================================
 */

async function saveToken(
    node,
    token,
    button,
    imageLabel
) {
    if (!token) {
        button.textContent =
            "Run Workflow First";

        return;
    }


    const normalName =
        `Save Image ${imageLabel}`;


    button.textContent =
        `Saving Image ${imageLabel}...`;

    button.disabled =
        true;


    try {
        const response =
            await api.fetchApi(
                SAVE_ENDPOINT,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            token,
                        }),
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.ok
        ) {
            throw new Error(
                data.message ||
                (
                    `Image ${imageLabel} ` +
                    "could not be saved."
                )
            );
        }


        button.textContent =
            `Saved Image ${imageLabel} ✓`;


        console.log(
            "[Unclad Image Preview]",
            data.message,
            data.paths
        );

    } catch (
        error
    ) {
        console.error(
            "[Unclad Image Preview]",
            error
        );


        button.textContent =
            `Save ${imageLabel} Failed`;


        window.alert(
            (
                "Unclad Image Preview:\n" +
                error.message
            )
        );
    }


    node.setDirtyCanvas?.(
        true,
        true
    );


    window.setTimeout(
        () => {

            button.disabled =
                false;

            button.textContent =
                normalName;

            node.setDirtyCanvas?.(
                true,
                true
            );
        },

        2500
    );
}


/*
 * =========================================================
 * Button creation
 * =========================================================
 */

function createButton(label) {
    const button =
        applyStyles(
            document.createElement(
                "button"
            ),
            {
                height:
                    "32px",

                minHeight:
                    "32px",

                flex:
                    "1 1 0",

                minWidth:
                    "0",

                boxSizing:
                    "border-box",

                border:
                    "1px solid rgba(255,255,255,0.18)",

                borderRadius:
                    "6px",

                background:
                    "#34343b",

                color:
                    "#f4f4f4",

                fontFamily:
                    "inherit",

                fontSize:
                    "11px",

                fontWeight:
                    "700",

                cursor:
                    "pointer",
            }
        );


    button.type =
        "button";

    button.textContent =
        label;


    button.addEventListener(
        "mouseenter",
        () => {

            if (
                !button.disabled
            ) {
                button.style.background =
                    "#45454d";
            }
        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            button.style.background =
                "#34343b";
        }
    );


    return button;
}


/*
 * =========================================================
 * Compare panel
 * =========================================================
 */

function createComparePanel(node) {

    /*
     * -----------------------------------------------------
     * ROOT
     * -----------------------------------------------------
     */

    const root =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
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

                gap:
                    "7px",

                padding:
                    "2px",

                overflow:
                    "hidden",
            }
        );


    /*
     * -----------------------------------------------------
     * COMPARE AREA
     * -----------------------------------------------------
     */

    const compareArea =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                display:
                    "none",

                flexDirection:
                    "column",

                gap:
                    "6px",

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
     * -----------------------------------------------------
     * VIEWER
     * -----------------------------------------------------
     */

    const viewer =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "relative",

                width:
                    "100%",

                height:
                    "400px",

                overflow:
                    "hidden",

                border:
                    "1px solid rgba(255,255,255,0.17)",

                borderRadius:
                    "8px",

                background:
                    "#111116",

                boxSizing:
                    "border-box",

                cursor:
                    "ew-resize",

                touchAction:
                    "none",

                userSelect:
                    "none",
            }
        );


    /*
     * -----------------------------------------------------
     * IMAGE B
     *
     * B is the full background image.
     * -----------------------------------------------------
     */

    const imageB =
        applyStyles(
            document.createElement(
                "img"
            ),
            {
                position:
                    "absolute",

                inset:
                    "0",

                width:
                    "100%",

                height:
                    "100%",

                objectFit:
                    "contain",

                display:
                    "block",

                userSelect:
                    "none",

                pointerEvents:
                    "none",
            }
        );


    imageB.draggable =
        false;


    /*
     * -----------------------------------------------------
     * IMAGE A
     *
     * A sits over B and is clipped from the right.
     * -----------------------------------------------------
     */

    const imageAClip =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "absolute",

                inset:
                    "0",

                overflow:
                    "hidden",

                clipPath:
                    "inset(0 50% 0 0)",

                pointerEvents:
                    "none",
            }
        );


    const imageA =
        applyStyles(
            document.createElement(
                "img"
            ),
            {
                position:
                    "absolute",

                inset:
                    "0",

                width:
                    "100%",

                height:
                    "100%",

                objectFit:
                    "contain",

                display:
                    "block",

                userSelect:
                    "none",

                pointerEvents:
                    "none",
            }
        );


    imageA.draggable =
        false;


    imageAClip.appendChild(
        imageA
    );


    /*
     * -----------------------------------------------------
     * DIVIDER
     * -----------------------------------------------------
     */

    const divider =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "absolute",

                top:
                    "0",

                bottom:
                    "0",

                left:
                    "50%",

                width:
                    "3px",

                transform:
                    "translateX(-1.5px)",

                background:
                    "rgba(255,255,255,0.97)",

                boxShadow:
                    (
                        "0 0 7px " +
                        "rgba(0,0,0,0.85)"
                    ),

                pointerEvents:
                    "none",

                zIndex:
                    "10",
            }
        );


    /*
     * -----------------------------------------------------
     * DIVIDER HANDLE
     * -----------------------------------------------------
     */

    const dividerHandle =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "absolute",

                top:
                    "50%",

                left:
                    "50%",

                width:
                    "34px",

                height:
                    "34px",

                transform:
                    "translate(-50%, -50%)",

                borderRadius:
                    "50%",

                border:
                    "2px solid rgba(255,255,255,0.98)",

                background:
                    "rgba(24,24,30,0.88)",

                boxSizing:
                    "border-box",

                display:
                    "flex",

                alignItems:
                    "center",

                justifyContent:
                    "center",

                color:
                    "#ffffff",

                fontSize:
                    "16px",

                fontWeight:
                    "700",

                boxShadow:
                    "0 2px 8px rgba(0,0,0,0.75)",

                pointerEvents:
                    "none",
            }
        );


    dividerHandle.textContent =
        "↔";


    divider.appendChild(
        dividerHandle
    );


    /*
     * -----------------------------------------------------
     * LABELS
     * -----------------------------------------------------
     */

    const labelA =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "absolute",

                left:
                    "9px",

                top:
                    "9px",

                zIndex:
                    "12",

                padding:
                    "4px 7px",

                borderRadius:
                    "5px",

                background:
                    "rgba(0,0,0,0.68)",

                color:
                    "#ffffff",

                fontSize:
                    "10px",

                fontWeight:
                    "700",

                pointerEvents:
                    "none",
            }
        );


    labelA.textContent =
        "IMAGE A";


    const labelB =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                position:
                    "absolute",

                right:
                    "9px",

                top:
                    "9px",

                zIndex:
                    "12",

                padding:
                    "4px 7px",

                borderRadius:
                    "5px",

                background:
                    "rgba(0,0,0,0.68)",

                color:
                    "#ffffff",

                fontSize:
                    "10px",

                fontWeight:
                    "700",

                pointerEvents:
                    "none",
            }
        );


    labelB.textContent =
        "IMAGE B";


    viewer.append(
        imageB,
        imageAClip,
        divider,
        labelA,
        labelB
    );


    /*
     * =====================================================
     * DIRECT DRAGGING ON THE IMAGE
     * =====================================================
     */

    let dragging =
        false;


    function updateFromPointer(
        event
    ) {
        const rect =
            viewer.getBoundingClientRect();


        if (
            rect.width <= 0
        ) {
            return;
        }


        const x =
            event.clientX -
            rect.left;


        const percent =
            (
                x /
                rect.width
            ) * 100;


        setComparePosition(
            node,
            percent
        );
    }


    viewer.addEventListener(
        "pointerdown",
        (event) => {

            dragging =
                true;


            viewer.setPointerCapture?.(
                event.pointerId
            );


            updateFromPointer(
                event
            );


            event.preventDefault();
            event.stopPropagation();
        }
    );


    viewer.addEventListener(
        "pointermove",
        (event) => {

            if (
                !dragging
            ) {
                return;
            }


            updateFromPointer(
                event
            );


            event.preventDefault();
            event.stopPropagation();
        }
    );


    viewer.addEventListener(
        "pointerup",
        (event) => {

            dragging =
                false;


            viewer.releasePointerCapture?.(
                event.pointerId
            );


            event.preventDefault();
            event.stopPropagation();
        }
    );


    viewer.addEventListener(
        "pointercancel",
        () => {

            dragging =
                false;
        }
    );


    /*
     * -----------------------------------------------------
     * SLIDER ROW
     * -----------------------------------------------------
     *
     * Keep this as a second way to move the comparison.
     */

    const sliderRow =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                display:
                    "grid",

                gridTemplateColumns:
                    "28px minmax(0,1fr) 28px",

                gap:
                    "7px",

                alignItems:
                    "center",

                width:
                    "100%",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                height:
                    "24px",

                minHeight:
                    "24px",
            }
        );


    const sliderALabel =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                textAlign:
                    "center",

                fontSize:
                    "10px",

                fontWeight:
                    "700",

                color:
                    "rgba(255,255,255,0.65)",
            }
        );


    sliderALabel.textContent =
        "A";


    const slider =
        document.createElement(
            "input"
        );


    slider.type =
        "range";

    slider.min =
        "0";

    slider.max =
        "100";

    slider.step =
        "1";

    slider.value =
        "50";


    applyStyles(
        slider,
        {
            width:
                "100%",

            minWidth:
                "0",

            margin:
                "0",

            cursor:
                "ew-resize",
        }
    );


    const sliderBLabel =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                textAlign:
                    "center",

                fontSize:
                    "10px",

                fontWeight:
                    "700",

                color:
                    "rgba(255,255,255,0.65)",
            }
        );


    sliderBLabel.textContent =
        "B";


    sliderRow.append(
        sliderALabel,
        slider,
        sliderBLabel
    );


    slider.addEventListener(
        "input",
        () => {

            setComparePosition(
                node,
                Number(
                    slider.value
                )
            );
        }
    );


    /*
     * -----------------------------------------------------
     * COMPARE CONTENT
     * -----------------------------------------------------
     */

    compareArea.append(
        viewer,
        sliderRow
    );


    /*
     * =====================================================
     * SAVE BUTTONS
     * =====================================================
     */

    const buttonRow =
        applyStyles(
            document.createElement(
                "div"
            ),
            {
                display:
                    "flex",

                flex:
                    "0 0 34px",

                height:
                    "34px",

                minHeight:
                    "34px",

                gap:
                    "7px",

                width:
                    "100%",

                maxWidth:
                    "100%",

                boxSizing:
                    "border-box",

                overflow:
                    "visible",
            }
        );


    const buttonA =
        createButton(
            "Save Image A"
        );


    const buttonB =
        createButton(
            "Save Image B"
        );


    buttonB.style.display =
        "none";


    buttonA.addEventListener(
        "click",
        async (
            event
        ) => {

            event.preventDefault();
            event.stopPropagation();


            await saveToken(
                node,
                node.ucSaveTokenA,
                buttonA,
                "A"
            );
        }
    );


    buttonB.addEventListener(
        "click",
        async (
            event
        ) => {

            event.preventDefault();
            event.stopPropagation();


            await saveToken(
                node,
                node.ucSaveTokenB,
                buttonB,
                "B"
            );
        }
    );


    buttonRow.append(
        buttonA,
        buttonB
    );


    root.append(
        compareArea,
        buttonRow
    );


    /*
     * Don't allow button/slider operation to drag
     * the entire ComfyUI node.
     */
    buttonRow.addEventListener(
        "pointerdown",
        (
            event
        ) => {

            event.stopPropagation();
        }
    );


    sliderRow.addEventListener(
        "pointerdown",
        (
            event
        ) => {

            event.stopPropagation();
        }
    );


    /*
     * -----------------------------------------------------
     * DOM widget
     * -----------------------------------------------------
     */

    const widget =
        node.addDOMWidget(
            "ucn_image_preview_controls",

            "ucn_image_preview_controls",

            root,

            {
                serialize:
                    false,

                hideOnZoom:
                    false,
            }
        );


    widget.computeSize =
        (width) => [
            Math.max(
                width ?? 620,
                596
            ),

            node.ucHasImageB
                ? 500
                : 40,
        ];


    return {
        widget,

        root,

        compareArea,

        viewer,

        imageA,

        imageB,

        imageAClip,

        divider,

        dividerHandle,

        slider,

        buttonRow,

        buttonA,

        buttonB,

        comparePercent:
            50,
    };
}


/*
 * =========================================================
 * Update compare UI after execution
 * =========================================================
 */

function updateCompareUI(
    node,
    message
) {
    if (
        !node.ucCompareUI
    ) {
        return;
    }


    const ui =
        node.ucCompareUI;


    const entriesA =
        normalizeEntries(
            message
                ?.image_a_entries
        );


    const entriesB =
        normalizeEntries(
            message
                ?.image_b_entries
        );


    const hasImageB =
        Boolean(
            firstValue(
                message
                    ?.has_image_b
            )
        );


    const autoSavedA =
        Boolean(
            firstValue(
                message
                    ?.auto_saved_a
            )
        );


    const autoSavedB =
        Boolean(
            firstValue(
                message
                    ?.auto_saved_b
            )
        );


    node.ucSaveTokenA =
        firstValue(
            message
                ?.save_token_a
        ) || null;


    node.ucSaveTokenB =
        firstValue(
            message
                ?.save_token_b
        ) || null;


    node.ucHasImageB =
        hasImageB;


    /*
     * =====================================================
     * SINGLE IMAGE MODE
     * =====================================================
     */

    if (
        !hasImageB
    ) {
        ui.compareArea.style.display =
            "none";


        ui.buttonA.style.display =
            "";


        ui.buttonB.style.display =
            "none";


        if (
            autoSavedA
        ) {
            ui.buttonA.textContent =
                "Auto-Saved Image A ✓";

            ui.buttonA.disabled =
                true;

        } else {
            ui.buttonA.textContent =
                "Save Image A";

            ui.buttonA.disabled =
                false;
        }
    }


    /*
     * =====================================================
     * COMPARE MODE
     * =====================================================
     */

    else {
        ui.compareArea.style.display =
            "flex";


        ui.buttonA.style.display =
            "";


        ui.buttonB.style.display =
            "";


        /*
         * Hide the regular ComfyUI image preview.
         * Our A/B viewer becomes the preview.
         */
        if (
            "imgs" in node
        ) {
            node.imgs =
                null;
        }


        const entryA =
            entriesA[0];


        const entryB =
            entriesB[0];


        if (
            entryA
        ) {
            ui.imageA.src =
                previewUrl(
                    entryA
                );
        }


        if (
            entryB
        ) {
            ui.imageB.src =
                previewUrl(
                    entryB
                );
        }


        /*
         * Start each comparison in the center.
         */
        setComparePosition(
            node,
            50
        );


        /*
         * Auto-save true:
         * indicate that each was already saved.
         *
         * Auto-save false:
         * BOTH buttons remain visible and enabled.
         */
        if (
            autoSavedA
        ) {
            ui.buttonA.textContent =
                "Auto-Saved Image A ✓";

            ui.buttonA.disabled =
                true;

        } else {
            ui.buttonA.textContent =
                "Save Image A";

            ui.buttonA.disabled =
                false;
        }


        if (
            autoSavedB
        ) {
            ui.buttonB.textContent =
                "Auto-Saved Image B ✓";

            ui.buttonB.disabled =
                true;

        } else {
            ui.buttonB.textContent =
                "Save Image B";

            ui.buttonB.disabled =
                false;
        }
    }


    delayedRefresh(
        node
    );
}


/*
 * =========================================================
 * ComfyUI extension
 * =========================================================
 */

app.registerExtension({
    name:
        "UncladComfyNodes.ImagePreviewCompare",


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


        const originalOnResize =
            nodeType.prototype
                .onResize;


        /*
         * -------------------------------------------------
         * Node created
         * -------------------------------------------------
         */

        nodeType.prototype.onNodeCreated =
            function () {

                const result =
                    originalOnNodeCreated
                        ?.apply(
                            this,
                            arguments
                        );


                const node =
                    this;


                node.ucSaveTokenA =
                    null;


                node.ucSaveTokenB =
                    null;


                node.ucHasImageB =
                    false;


                node.ucCompareUI =
                    createComparePanel(
                        node
                    );


                /*
                 * Reasonable initial width.
                 */
                node.setSize?.([
                    Math.max(
                        node.size?.[0] ??
                            700,

                        700
                    ),

                    node.size?.[1] ??
                        300,
                ]);


                delayedRefresh(
                    node
                );


                return result;
            };


        /*
         * -------------------------------------------------
         * Workflow executed
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


                updateCompareUI(
                    this,
                    message
                );


                this.setDirtyCanvas?.(
                    true,
                    true
                );


                app.graph?.setDirtyCanvas?.(
                    true,
                    true
                );
            };


        /*
         * -------------------------------------------------
         * Node resized
         * -------------------------------------------------
         *
         * Keep the compare viewer synchronized with
         * the actual node width.
         */

        nodeType.prototype.onResize =
            function (
                size
            ) {

                const minimumWidth =
                    this.ucHasImageB
                        ? 700
                        : 420;


                const requestedWidth =
                    Array.isArray(size)
                        ? size[0]
                        : this.size?.[0];


                const requestedHeight =
                    Array.isArray(size)
                        ? size[1]
                        : this.size?.[1];


                /*
                * Prevent the node from becoming too narrow.
                */
                const safeSize = [
                    Math.max(
                        requestedWidth ??
                            minimumWidth,

                        minimumWidth
                    ),

                    requestedHeight ??
                        this.size?.[1] ??
                        300,
                ];


                /*
                * Let the original ComfyUI resize handler run,
                * but with our corrected minimum width.
                */
                const result =
                    originalOnResize
                        ?.call(
                            this,
                            safeSize
                        );


                /*
                * Some LiteGraph versions may still leave
                * this.size with the requested value, so enforce
                * it again afterward.
                */
                if (
                    this.size?.[0] <
                    minimumWidth
                ) {
                    this.size[0] =
                        minimumWidth;
                }


                const node =
                    this;


                requestAnimationFrame(
                    () => {

                        if (
                            node.size?.[0] <
                            minimumWidth
                        ) {
                            node.size[0] =
                                minimumWidth;
                        }


                        syncComparePanelSize(
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
                );


                return result;
            };
    },
});