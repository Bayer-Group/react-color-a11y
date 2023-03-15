import React, { useState } from 'react'
import ReactColorA11y from 'react-color-a11y'
import {
  Box,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import SettingsBox from './SettingsBox'

function App (): JSX.Element {
  const [electronPathColor, setElectronPathColor] = useState('#707070')
  const [nucleusParticleFillColor, setNucleusParticleFillColor] = useState('#707070')

  return (
    <Box sx={{ flexGrow: 1, padding: 5 }}>
      <Grid container>
        <Grid xs={12} lg={6} display="flex" justifyContent="center">
          <div style={{ background: '#111', color: '#222' }}>
            <p>This text is hard to see... 😢</p>
            <p>Never fear, ReactColorA11y will fix it! 🎉</p>
          </div>
        </Grid>
        <Grid xs={12} lg={6} display="flex" justifyContent="center">
          <ReactColorA11y>
            <div style={{ background: '#111', color: '#222' }}>
              <p>This text is hard to see... 😢</p>
              <p>Never fear, ReactColorA11y will fix it! 🎉</p>
            </div>
          </ReactColorA11y>
        </Grid>
      </Grid>
      <Grid container>
        <Grid xs={12} lg={6}>
          <SettingsBox>
            <Typography gutterBottom>Electron Path Color</Typography>
            <HexColorPicker style={{ margin: '15px auto' }} color={electronPathColor} onChange={setElectronPathColor} />
            <HexColorInput alpha color={electronPathColor} onChange={setElectronPathColor} />
          </SettingsBox>
        </Grid>
        <Grid xs={12} lg={6}>
          <SettingsBox>
            <Typography gutterBottom>Nucleus Particle Fill Color</Typography>
            <HexColorPicker style={{ margin: '15px auto' }} color={nucleusParticleFillColor} onChange={setNucleusParticleFillColor} />
            <HexColorInput alpha color={nucleusParticleFillColor} onChange={setNucleusParticleFillColor} />
          </SettingsBox>
        </Grid>
      </Grid>
    </Box>
  )
}

export default App
