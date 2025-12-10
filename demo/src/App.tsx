import React, { JSX, useRef, useState } from 'react'
import ReactColorA11y from 'react-color-a11y'
import {
  Box,
  Typography,
  Slider,
  Switch,
  Grid
} from '@mui/material'
import { HexAlphaColorPicker, HexColorInput } from 'react-colorful'
import SettingsBox from './SettingsBox'

const TextContent = (): JSX.Element => (
  <>
    <p>This text might be hard to see... 😢</p>
    <p>Never fear, ReactColorA11y will fix it! 🎉</p>
  </>
)

const SvgContent = ({ fillColor }: { fillColor: string }): JSX.Element => (
  <svg viewBox="0 0 200 200" height={200} width={200}>
    <g transform="translate(100 100)">
      <path
        d="M37,-65.3C49.4,-56.8,62,-50,57.7,-39.3C53.5,-28.7,32.3,-14.4,27.1,-3C21.9,8.4,32.8,16.8,31.8,18.3C30.9,19.8,18,14.3,10.7,20.6C3.4,26.9,1.7,44.9,-5.6,54.6C-12.9,64.3,-25.8,65.7,-28.4,56.7C-31.1,47.8,-23.4,28.4,-30.4,17.2C-37.3,6.1,-58.9,3,-69,-5.8C-79.1,-14.7,-77.8,-29.4,-66.9,-33.7C-55.9,-38,-35.4,-31.9,-22.7,-40.2C-9.9,-48.5,-5,-71.2,3.6,-77.6C12.3,-83.9,24.5,-73.8,37,-65.3Z"
        fill={fillColor}
      />
    </g>
  </svg>
)

function App(): JSX.Element {
  const textContentRef = useRef(null)
  const svgContentRef = useRef(null)
  const [backgroundColor, setBackgroundColor] = useState('#222222')
  const [foregroundColor, setForegroundColor] = useState('#333333')
  const [requiredContrastRatio, setRequiredContrastRatio] = useState(4.5)
  const [flipBlackAndWhite, setFlipBlackAndWhite] = useState(false)
  const [preserveContrastDirectionIfPossible, setPreserveContrastDirectionIfPossible] = useState(true)
  const [backgroundColorOverride, setBackgroundColorOverride] = useState<string | undefined>()

  return (
    <>
      <Box sx={{ background: backgroundColor, flexGrow: 1, padding: 2 }}>
        <Grid container sx={{ paddingBottom: 2 }}>
          <Grid size={{ xs: 12, lg: 6 }} display="flex" justifyContent="center">
            <div style={{ padding: '20px', color: foregroundColor }}>
              <h3>{'Without <ReactColorA11y>'}</h3>
              <TextContent />
            </div>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }} display="flex" justifyContent="center">
            <ReactColorA11y
              // For demo only, force re-render every time
              colorPaletteKey={Math.random().toString()}
              requiredContrastRatio={requiredContrastRatio}
              flipBlackAndWhite={flipBlackAndWhite}
              preserveContrastDirectionIfPossible={preserveContrastDirectionIfPossible}
              backgroundColorOverride={backgroundColorOverride}
            >
              <div ref={textContentRef} style={{ padding: '20px', color: foregroundColor }}>
                <h3>{'With <ReactColorA11y>'}</h3>
                <TextContent />
              </div>
            </ReactColorA11y>
          </Grid>
        </Grid>
        <Grid container sx={{ paddingBottom: 2 }}>
          <Grid size={{ xs: 12, lg: 6 }} display="flex" justifyContent="center">
            <div>
              <SvgContent fillColor={foregroundColor} />
            </div>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }} display="flex" justifyContent="center">
            <ReactColorA11y
              // For demo only, force re-render every time
              colorPaletteKey={Math.random().toString()}
              requiredContrastRatio={requiredContrastRatio}
              flipBlackAndWhite={flipBlackAndWhite}
              preserveContrastDirectionIfPossible={preserveContrastDirectionIfPossible}
              backgroundColorOverride={backgroundColorOverride}
            >
              <div ref={svgContentRef}>
                <SvgContent fillColor={foregroundColor} />
              </div>
            </ReactColorA11y>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ flexGrow: 1, padding: 5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, xl: 2, md: 3 }}>
            <SettingsBox>
              <Typography gutterBottom>Background Color</Typography>
              <HexAlphaColorPicker style={{ margin: '15px auto' }} color={backgroundColor} onChange={setBackgroundColor} />
              <HexColorInput alpha color={backgroundColor} onChange={setBackgroundColor} />
            </SettingsBox>
          </Grid>
          <Grid size={{ xs: 12, xl: 2, md: 3 }}>
            <SettingsBox>
              <Typography gutterBottom>Foreground Color</Typography>
              <HexAlphaColorPicker style={{ margin: '15px auto' }} color={foregroundColor} onChange={setForegroundColor} />
              <HexColorInput alpha color={foregroundColor} onChange={setForegroundColor} />
            </SettingsBox>
          </Grid>
          <Grid size={{ xs: 12, lg: 2 }}>
            <SettingsBox>
              <Typography gutterBottom>Required Contrast Ratio</Typography>
              <Slider
                value={requiredContrastRatio}
                valueLabelDisplay="auto"
                step={0.5}
                min={1}
                max={21}
                onChange={(_event, value) => setRequiredContrastRatio(value)}
              />
            </SettingsBox>
          </Grid>
          <Grid size={{ xs: 12, lg: 2 }}>
            <SettingsBox>
              <Typography gutterBottom>Flip Black and White</Typography>
              <Typography gutterBottom>(only impacts #000 and #fff)</Typography>
              <Switch
                checked={flipBlackAndWhite}
                onChange={(_event, checked) => setFlipBlackAndWhite(checked)}
              />
            </SettingsBox>
          </Grid>
          <Grid size={{ xs: 12, lg: 2 }}>
            <SettingsBox>
              <Typography gutterBottom>Preserve Contrast Direction If Possible</Typography>
              <Switch
                checked={preserveContrastDirectionIfPossible}
                onChange={(_event, checked) => setPreserveContrastDirectionIfPossible(checked)}
              />
            </SettingsBox>
          </Grid>
          <Grid size={{ xs: 12, xl: 2, md: 3 }}>
            <SettingsBox>
              <Typography gutterBottom>Background Color Override</Typography>
              <Switch
                checked={!!backgroundColorOverride}
                onChange={(_event, checked) => setBackgroundColorOverride(checked ? '#000000' : undefined)}
              />
              {backgroundColorOverride && (
                <>
                  <HexAlphaColorPicker style={{ margin: '15px auto' }} color={backgroundColorOverride} onChange={setBackgroundColorOverride} />
                  <HexColorInput alpha color={backgroundColorOverride} onChange={setBackgroundColorOverride} />
                </>
              )}
            </SettingsBox>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default App
