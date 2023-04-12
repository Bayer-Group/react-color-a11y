import React, { useCallback, useState } from 'react'
import ReactColorA11y from 'react-color-a11y'
import {
  Box,
  Typography,
  Slider,
  Switch,
  Unstable_Grid2 as Grid
} from '@mui/material'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import SettingsBox from './SettingsBox'

function App (): JSX.Element {
  const [backgroundColor, setBackgroundColor] = useState('#222222')
  const [foregroundColor, setForegroundColor] = useState('#333333')
  const [requiredContrastRatio, setRequiredContrastRatio] = useState(4.5)
  const [flipBlackAndWhite, setFlipBlackAndWhite] = useState(false)
  const [preserveContrastDirectionIfPossible, setPreserveContrastDirectionIfPossible] = useState(true)

  const requiredContrastRatioChangeHandler = useCallback((_event: unknown, value: number | number[]) => {
    setRequiredContrastRatio(Number(value))
  }, [])

  const flipBlackAndWhiteChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFlipBlackAndWhite(event.target.checked)
  }, [])

  const preserveContrastDirectionIfPossibleChangeHandler = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPreserveContrastDirectionIfPossible(event.target.checked)
  }, [])

  return (
    <Box sx={{ flexGrow: 1, padding: 5 }}>
      <Grid container sx={{ paddingBottom: 5 }}>
        <Grid xs={12} lg={6} display="flex" justifyContent="center">
          <div style={{ padding: '20px', background: backgroundColor, color: foregroundColor }}>
            <p>This text might be hard to see... 😢</p>
            <p>Never fear, ReactColorA11y will fix it! 🎉</p>
          </div>
        </Grid>
        <Grid xs={12} lg={6} display="flex" justifyContent="center">
          <ReactColorA11y
            // For demo only, force re-render every time
            colorPaletteKey={Math.random().toString()}
            requiredContrastRatio={requiredContrastRatio}
            flipBlackAndWhite={flipBlackAndWhite}
            preserveContrastDirectionIfPossible={preserveContrastDirectionIfPossible}
          >
            <div style={{ padding: '20px', background: backgroundColor, color: foregroundColor }}>
              <p>This text might be hard to see... 😢</p>
              <p>Never fear, ReactColorA11y will fix it! 🎉</p>
            </div>
          </ReactColorA11y>
        </Grid>
      </Grid>
      <Grid container sx={{ paddingBottom: 5 }}>
        <Grid xs={12} lg={6} display="flex" justifyContent="center">
          <div style={{ padding: '20px', background: backgroundColor, color: foregroundColor }}>
            <svg height={100} width={100}>
              <circle id="circle-1" cx={50} cy={50} r={50} stroke={foregroundColor} fill={foregroundColor} />
            </svg>
          </div>
        </Grid>
        <Grid xs={12} lg={6} display="flex" justifyContent="center">
          <ReactColorA11y
            // For demo only, force re-render every time
            colorPaletteKey={Math.random().toString()}
            requiredContrastRatio={requiredContrastRatio}
            flipBlackAndWhite={flipBlackAndWhite}
            preserveContrastDirectionIfPossible={preserveContrastDirectionIfPossible}
          >
            <div style={{ padding: '20px', background: backgroundColor, color: foregroundColor }}>
            <svg height={100} width={100}>
              <circle id="circle-1" cx={50} cy={50} r={50} stroke={foregroundColor} fill={foregroundColor} />
            </svg>
          </div>
          </ReactColorA11y>
        </Grid>
      </Grid>
      <Grid container spacing={2} alignItems="center">
        <Grid xs={12} lg={3}>
          <SettingsBox>
            <Typography gutterBottom>Background Color</Typography>
            <HexColorPicker style={{ margin: '15px auto' }} color={backgroundColor} onChange={setBackgroundColor} />
            <HexColorInput alpha color={backgroundColor} onChange={setBackgroundColor} />
          </SettingsBox>
        </Grid>
        <Grid xs={12} lg={3}>
          <SettingsBox>
            <Typography gutterBottom>Foreground Color</Typography>
            <HexColorPicker style={{ margin: '15px auto' }} color={foregroundColor} onChange={setForegroundColor} />
            <HexColorInput alpha color={foregroundColor} onChange={setForegroundColor} />
          </SettingsBox>
        </Grid>
        <Grid xs={12} lg={2}>
          <SettingsBox>
            <Typography gutterBottom>Required Contrast Ratio</Typography>
            <Slider
              defaultValue={4.5}
              valueLabelDisplay="auto"
              step={0.5}
              min={0}
              max={21}
              onChangeCommitted={requiredContrastRatioChangeHandler}
            />
          </SettingsBox>
        </Grid>
        <Grid xs={12} lg={2}>
          <SettingsBox>
            <Typography gutterBottom>Flip Black and White</Typography>
            <Typography gutterBottom>(only impacts #000 and #fff)</Typography>
            <Switch
              checked={flipBlackAndWhite}
              onChange={flipBlackAndWhiteChangeHandler}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </SettingsBox>
        </Grid>
        <Grid xs={12} lg={2}>
          <SettingsBox>
            <Typography gutterBottom>Preserve Contrast Direction If Possible</Typography>
            <Switch
              checked={preserveContrastDirectionIfPossible}
              onChange={preserveContrastDirectionIfPossibleChangeHandler}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </SettingsBox>
        </Grid>
      </Grid>
    </Box>
  )
}

export default App
