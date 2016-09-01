import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconMenuTheme from './icon-menu-theme';



const SimpleIconMenu = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(IconMenuTheme)}>
    <div>
      <IconMenu
        iconButtonElement={<span className="octicon octicon-chevron-down" />}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem primaryText="Execute Cell" />
        <MenuItem primaryText="Delete Cell" />
        <MenuItem primaryText="Clear Cell Output" />
        <MenuItem primaryText="Toggle Input Visibility" />
        <MenuItem primaryText="Toggle Output Visibility" />
        <MenuItem primaryText="Convert to..." />
      </IconMenu>
    </div>
  </MuiThemeProvider>
);

export default SimpleIconMenu;
