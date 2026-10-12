from .preset_data import (

    STYLE_PRIORITY_RULE,

    LOOK_AND_FEEL_PRESETS,

    LIGHTING_PRESETS,

    CAMERA_PRESETS,

    CREATIVE_ENHANCEMENT_PRESETS,

)



from .image_preview import (

    UCNImagePreview,

)



def _clean_part(value):

    if not isinstance(value, str):

        return ""



    return value.strip().strip(" ,;")





def _join_prompt_parts(parts):

    cleaned = []



    for value in parts:

        value = _clean_part(value)



        if value:

            cleaned.append(value)



    return "\n\n".join(cleaned)





# =========================================================

# Unclad Prompt Studio

# =========================================================



class UCNPromptStudio:

    """All-in-one prompt composer with visual preset libraries."""



    @classmethod

    def INPUT_TYPES(cls):

        look_choices = [

            "No Preset",

        ] + list(

            LOOK_AND_FEEL_PRESETS.keys()

        )



        lighting_choices = [

            "No Preset",

        ] + list(

            LIGHTING_PRESETS.keys()

        )



        camera_choices = [

            "No Preset",

        ] + list(

            CAMERA_PRESETS.keys()

        )



        enhancement_choices = [

            "No Preset",

        ] + list(

            CREATIVE_ENHANCEMENT_PRESETS.keys()

        )



        return {

            "required": {

                "prompt_prefix": (

                    "STRING",

                    {

                        "default": "",

                        "multiline": True,

                    },

                ),



                "main_prompt_content": (

                    "STRING",

                    {

                        "default": "",

                        "multiline": True,

                    },

                ),



                "look_and_feel": (

                    look_choices,

                    {

                        "default": "No Preset",

                    },

                ),



                "lighting": (

                    lighting_choices,

                    {

                        "default": "No Preset",

                    },

                ),



                "camera": (

                    camera_choices,

                    {

                        "default": "No Preset",

                    },

                ),



                "prompt_suffix": (

                    "STRING",

                    {

                        "default": "",

                        "multiline": True,

                    },

                ),



                "creative_enhancement": (

                    enhancement_choices,

                    {

                        "default": "No Preset",

                    },

                ),

            }

        }



    RETURN_TYPES = (

        "STRING",

    )



    RETURN_NAMES = (

        "prompt",

    )



    FUNCTION = "build_prompt"



    CATEGORY = (

        "Unclad Comfy Nodes/Prompt Tools"

    )



    OUTPUT_NODE = True



    def build_prompt(

        self,

        prompt_prefix,

        main_prompt_content,

        look_and_feel,

        lighting,

        camera,

        prompt_suffix,

        creative_enhancement,

    ):

        look_text = (

            LOOK_AND_FEEL_PRESETS.get(

                look_and_feel,

                "",

            )

        )



        lighting_text = (

            LIGHTING_PRESETS.get(

                lighting,

                "",

            )

        )



        camera_text = (

            CAMERA_PRESETS.get(

                camera,

                "",

            )

        )



        enhancement_text = (

            CREATIVE_ENHANCEMENT_PRESETS.get(

                creative_enhancement,

                "",

            )

        )



        style_priority_text = (

            STYLE_PRIORITY_RULE

            if look_text

            else ""

        )



        combined = _join_prompt_parts([

            prompt_prefix,

            main_prompt_content,

            look_text,

            style_priority_text,

            lighting_text,

            camera_text,

            enhancement_text,

            prompt_suffix,

        ])



        return {

            "ui": {

                "combined_text": [

                    combined,

                ],



                "look_text": [

                    look_text,

                ],



                "style_priority_text": [

                    style_priority_text,

                ],



                "lighting_text": [

                    lighting_text,

                ],



                "camera_text": [

                    camera_text,

                ],



                "enhancement_text": [

                    enhancement_text,

                ],

            },



            "result": (

                combined,

            ),

        }





# =========================================================

# Unclad Image Size Preset

# =========================================================



class UCNImageSizePreset:

    """

    Provides useful image-generation dimensions for

    general images, websites, social media, print,

    posters, wallpapers, and cover artwork.

    """



    PRESETS = {



        # -------------------------------------------------

        # General AI image sizes

        # -------------------------------------------------



        "Square — Draft (1024 x 1024)": {

            "width": 1024,

            "height": 1024,

            "description": (

                "Standard square image for drafts "

                "and general-purpose generation."

            ),

        },



        "Square — Large (1536 x 1536)": {

            "width": 1536,

            "height": 1536,

            "description": (

                "Large square image suitable for "

                "high-quality generation and later upscaling."

            ),

        },



        "Landscape — Standard (1344 x 768)": {

            "width": 1344,

            "height": 768,

            "description": (

                "General landscape image with an "

                "approximately 16:9 aspect ratio."

            ),

        },



        "Landscape — Large (1536 x 896)": {

            "width": 1536,

            "height": 896,

            "description": (

                "Large landscape image suitable for "

                "website headers and cinematic scenes."

            ),

        },



        "Portrait — Standard (768 x 1344)": {

            "width": 768,

            "height": 1344,

            "description": (

                "General portrait image suitable for "

                "full-body subjects and vertical layouts."

            ),

        },



        "Portrait — Large (896 x 1536)": {

            "width": 896,

            "height": 1536,

            "description": (

                "Large portrait image suitable for "

                "posters and vertical compositions."

            ),

        },





        # -------------------------------------------------

        # Website images

        # -------------------------------------------------



        "Website Hero — Wide (1536 x 640)": {

            "width": 1536,

            "height": 640,

            "description": (

                "Wide website hero or landing-page banner."

            ),

        },



        "Website Banner — Extra Wide (1792 x 768)": {

            "width": 1792,

            "height": 768,

            "description": (

                "Extra-wide website banner with room "

                "for text and branding."

            ),

        },



        "Website Article Header (1344 x 768)": {

            "width": 1344,

            "height": 768,

            "description": (

                "Landscape image for blog articles, "

                "cards, and featured content."

            ),

        },



        "Website Card — Landscape (1216 x 832)": {

            "width": 1216,

            "height": 832,

            "description": (

                "Landscape image suitable for cards, "

                "listings, and content previews."

            ),

        },



        "Website Card — Square (1024 x 1024)": {

            "width": 1024,

            "height": 1024,

            "description": (

                "Square website card or gallery image."

            ),

        },





        # -------------------------------------------------

        # Social media

        # -------------------------------------------------



        "Facebook / Instagram — Square (1088 x 1088)": {

            "width": 1088,

            "height": 1088,

            "description": (

                "Square social-media post. "

                "Model-friendly alternative to 1080 x 1080."

            ),

        },



        "Facebook / Instagram — Portrait (1088 x 1344)": {

            "width": 1088,

            "height": 1344,

            "description": (

                "Portrait social-media feed post with "

                "an approximately 4:5 aspect ratio."

            ),

        },



        "Facebook / Instagram Story (1152 x 2048)": {

            "width": 1152,

            "height": 2048,

            "description": (

                "Vertical 9:16 story or reel image."

            ),

        },



        "Facebook Cover — Wide (1664 x 640)": {

            "width": 1664,

            "height": 640,

            "description": (

                "Wide cover-style image. Keep important "

                "content near the center."

            ),

        },



        "X Post — Landscape (1216 x 640)": {

            "width": 1216,

            "height": 640,

            "description": (

                "Landscape image for an X post, "

                "close to a 1.9:1 ratio."

            ),

        },



        "X Post — Square (1024 x 1024)": {

            "width": 1024,

            "height": 1024,

            "description": (

                "Square image for an X post."

            ),

        },



        "X Post — Portrait (1024 x 1280)": {

            "width": 1024,

            "height": 1280,

            "description": (

                "Portrait image for an X post."

            ),

        },



        "X Header — Generation (1536 x 512)": {

            "width": 1536,

            "height": 512,

            "description": (

                "Model-friendly X header generation size; "

                "resize or crop to 1500 x 500 for delivery."

            ),

        },



        "LinkedIn Post — Landscape (1216 x 640)": {

            "width": 1216,

            "height": 640,

            "description": (

                "Model-friendly landscape image close to "

                "LinkedIn's recommended 1.91:1 ratio."

            ),

        },



        "LinkedIn Post — Square (1088 x 1088)": {

            "width": 1088,

            "height": 1088,

            "description": (

                "Square LinkedIn post image."

            ),

        },



        "LinkedIn Cover — Generation (1536 x 384)": {

            "width": 1536,

            "height": 384,

            "description": (

                "Model-friendly LinkedIn cover generation size; "

                "resize or crop to 1584 x 396 for delivery."

            ),

        },



        "YouTube Thumbnail (1280 x 720)": {

            "width": 1280,

            "height": 720,

            "description": (

                "Standard 16:9 YouTube thumbnail."

            ),

        },



        "YouTube Channel Banner — Large (2560 x 1440)": {

            "width": 2560,

            "height": 1440,

            "description": (

                "Large YouTube channel banner. Keep text in "

                "the central safe area; this size uses "

                "substantially more VRAM."

            ),

        },





        # -------------------------------------------------

        # Print proportions

        #

        # These are generation sizes, not final print files.

        # Upscale before printing.

        # -------------------------------------------------



        "Print — 4 x 6 Landscape Ratio (1536 x 1024)": {

            "width": 1536,

            "height": 1024,

            "description": (

                "3:2 landscape ratio suitable for standard "

                "photographic prints after upscaling."

            ),

        },



        "Print — 4 x 6 Portrait Ratio (1024 x 1536)": {

            "width": 1024,

            "height": 1536,

            "description": (

                "3:2 portrait ratio suitable for standard "

                "photographic prints after upscaling."

            ),

        },



        "Print — 8 x 10 Portrait Ratio (1024 x 1280)": {

            "width": 1024,

            "height": 1280,

            "description": (

                "4:5 portrait ratio suitable for "

                "8 x 10 prints after upscaling."

            ),

        },



        "Print — 8 x 10 Landscape Ratio (1280 x 1024)": {

            "width": 1280,

            "height": 1024,

            "description": (

                "5:4 landscape ratio suitable for "

                "8 x 10 prints after upscaling."

            ),

        },



        "Print — 11 x 14 Portrait Ratio (1024 x 1280)": {

            "width": 1024,

            "height": 1280,

            "description": (

                "Approximate 11 x 14 portrait proportion "

                "for generation and later cropping."

            ),

        },



        "Print — A-Series Portrait (1024 x 1472)": {

            "width": 1024,

            "height": 1472,

            "description": (

                "Approximate ISO A-series paper ratio "

                "for A4, A3, and related print sizes."

            ),

        },



        "Print — A-Series Landscape (1472 x 1024)": {

            "width": 1472,

            "height": 1024,

            "description": (

                "Approximate ISO A-series landscape ratio."

            ),

        },





        # -------------------------------------------------

        # Posters

        # -------------------------------------------------



        "Poster — Portrait 2:3 (1024 x 1536)": {

            "width": 1024,

            "height": 1536,

            "description": (

                "Classic 2:3 portrait poster ratio."

            ),

        },



        "Poster — Landscape 3:2 (1536 x 1024)": {

            "width": 1536,

            "height": 1024,

            "description": (

                "Classic 3:2 landscape poster ratio."

            ),

        },



        "Poster — Movie Portrait (1024 x 1536)": {

            "width": 1024,

            "height": 1536,

            "description": (

                "Vertical movie-poster style composition "

                "with space for titles."

            ),

        },



        "Poster — Tall Portrait (896 x 1536)": {

            "width": 896,

            "height": 1536,

            "description": (

                "Tall portrait poster for dramatic "

                "full-body compositions."

            ),

        },



        "Poster — Square (1536 x 1536)": {

            "width": 1536,

            "height": 1536,

            "description": (

                "Large square poster or cover-art format."

            ),

        },





        # -------------------------------------------------

        # Other useful formats

        # -------------------------------------------------



        "Desktop Wallpaper — Full HD (1920 x 1080)": {

            "width": 1920,

            "height": 1080,

            "description": (

                "Standard 16:9 Full HD desktop wallpaper."

            ),

        },



        "Desktop Wallpaper — 2K (2560 x 1440)": {

            "width": 2560,

            "height": 1440,

            "description": (

                "16:9 QHD desktop wallpaper. "

                "Requires substantially more VRAM."

            ),

        },



        "Mobile Wallpaper (1152 x 2048)": {

            "width": 1152,

            "height": 2048,

            "description": (

                "9:16 vertical mobile wallpaper."

            ),

        },



        "Book Cover — Portrait (1024 x 1536)": {

            "width": 1024,

            "height": 1536,

            "description": (

                "Common 2:3 portrait format for "

                "book-cover artwork."

            ),

        },



        "Album Cover — Square (1536 x 1536)": {

            "width": 1536,

            "height": 1536,

            "description": (

                "Large square format for album covers "

                "and cover artwork."

            ),

        },

    }





    @classmethod

    def INPUT_TYPES(cls):

        return {

            "required": {

                "size_preset": (

                    list(

                        cls.PRESETS.keys()

                    ),

                    {

                        "default": (

                            "Square — Draft "

                            "(1024 x 1024)"

                        ),

                    },

                ),

            }

        }





    RETURN_TYPES = (

        "INT",

        "INT",

        "STRING",

    )



    RETURN_NAMES = (

        "width",

        "height",

        "description",

    )



    FUNCTION = "get_size"



    CATEGORY = (

        "Unclad Comfy Nodes/Workflow Tools"

    )





    def get_size(

        self,

        size_preset

    ):

        preset = self.PRESETS[

            size_preset

        ]



        return (

            int(

                preset["width"]

            ),



            int(

                preset["height"]

            ),



            preset[

                "description"

            ],

        )





# =========================================================

# Node Registration

# =========================================================



NODE_CLASS_MAPPINGS = {

    "UCNPromptStudio":

        UCNPromptStudio,



    "UCNImageSizePreset":

        UCNImageSizePreset,



    "UCNImagePreview":

        UCNImagePreview,

}





NODE_DISPLAY_NAME_MAPPINGS = {

    "UCNPromptStudio":

        "Unclad Prompt Studio",



    "UCNImageSizePreset":

        "Unclad Image Size Preset",



    "UCNImagePreview":

        "Unclad Image Preview",

}