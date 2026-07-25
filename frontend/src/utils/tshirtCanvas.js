/* Shared t-shirt mockup canvas constants — used by both the customer
   "Design Your Own" tool and the admin Mockup Generator so both render
   the exact same shirt asset, print area, and colour palette. */

/* Sourced from "Hexcode - Unisex T-shirt.xlsx" — 36 garment colours */
export const TSHIRT_COLORS = [
  { hex: '#2D0101', name: 'Maroon'           },
  { hex: '#E65E00', name: 'Orange'           },
  { hex: '#159512', name: 'Flag Green'       },
  { hex: '#CC2867', name: 'Pink'             },
  { hex: '#22482E', name: 'Bottle Green'     },
  { hex: '#1F286A', name: 'Royal Blue'       },
  { hex: '#321541', name: 'Purple'           },
  { hex: '#A50303', name: 'Red'              },
  { hex: '#F9D168', name: 'Yellow'           },
  { hex: '#EF9A31', name: 'Golden Yellow'    },
  { hex: '#FCFA30', name: 'New Yellow'       },
  { hex: '#19E4FF', name: 'Sky Blue'         },
  { hex: '#FFD5DB', name: 'Light Pink'       },
  { hex: '#6E6E6E', name: 'Charcoal Melange' },
  { hex: '#C3C3C3', name: 'Grey Melange'     },
  { hex: '#2D314A', name: 'Navy Blue'        },
  { hex: '#FFFFFF', name: 'White'            },
  { hex: '#7B2F1D', name: 'Brick Red'        },
  { hex: '#1C100F', name: 'Coffee Brown'     },
  { hex: '#453E2F', name: 'Olive Green'      },
  { hex: '#002A2F', name: 'Petrol Blue'      },
  { hex: '#3A3E41', name: 'Steel Grey'       },
  { hex: '#CF8F26', name: 'Mustard Yellow'   },
  { hex: '#151515', name: 'Black'            },
  { hex: '#EBCD8B', name: 'Beige'            },
  { hex: '#BBB1D2', name: 'Lavender'         },
  { hex: '#A4CEF8', name: 'Baby Blue'        },
  { hex: '#9D6333', name: 'Khaki'            },
  { hex: '#BFFCF7', name: 'Mint'             },
  { hex: '#C86E4E', name: 'Coral'            },
  { hex: '#E29891', name: 'Flamingo'         },
  { hex: '#CC9D93', name: 'Mushroom'         },
  { hex: '#CCF5C9', name: 'Jade'             },
  { hex: '#C2745F', name: 'Copper'           },
  { hex: '#FFDEC6', name: 'Peach'            },
  { hex: '#FFFAE7', name: 'Off White'        },
]

/*
  tshirt-front.png / tshirt-back.png — flat-lay product photos, background
  removed (transparent PNG) so the colour-multiply overlay only tints the
  garment itself.

  Print-area calibrated by scanning each image's alpha channel for the
  torso's horizontal extent at several heights (1254×1254 canvas):
    Torso (y=50–90 %): L≈20.5 %  R≈79.7 %  W≈59 %  Centre≈50.1 %
    (front and back are effectively identical — same shoot, same crop)
    Sleeves/collar flare out above y≈48 %, so the print area starts below that.

  14 × 16 in print area centred on the torso:
    width  = 36 %   (comfortable margin inside the ~59 % torso width)
    height = 36 % × (16/14) ≈ 41 %
    left   = 50 % − 18 % = 32 %
    top    = 22 %   (clear of the collar/sleeve flare)
*/
export const PA = { top: '22%', left: '32%', width: '36%', height: '41%' }

export const SHIRT_VIEWS = {
  front: { label: 'Front', src: '/tshirt-front.png', pa: PA },
  back:  { label: 'Back',  src: '/tshirt-back.png',  pa: PA },
}

/* Default/back-compat single-view export — the customer "Design Your Own"
   tool only ever shows the front. */
export const SHIRT_BASE = SHIRT_VIEWS.front.src

/* Qikink-blue palette */
export const BLUE      = 'rgba(38, 99, 235, 0.42)'
export const BLUE_BDR  = 'rgba(38, 99, 235, 0.80)'
export const BLUE_ICON = '#2563eb'

/* Shared mask style — clips the colour overlay to the shirt silhouette */
export function maskStyle(src) {
  return {
    maskImage:          `url(${src})`,
    maskSize:           'contain',
    maskPosition:       'center',
    maskRepeat:         'no-repeat',
    WebkitMaskImage:    `url(${src})`,
    WebkitMaskSize:     'contain',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat:   'no-repeat',
  }
}

export const SCALE_MIN = 0.3
export const SCALE_MAX = 2.5
