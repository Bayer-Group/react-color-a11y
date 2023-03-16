import React from 'react';
import { colord } from 'colord';
import ReactColorA11y from './ReactColorA11y';

describe('ReactColorA11y', () => {
  const expectedColorMappings = [
    { original: 'rgb(0, 0, 0)', lighter: 'rgb(255, 255, 255)', darker: 'rgb(0, 0, 0)' },
    { original: 'rgb(30, 30, 30)', lighter: 'rgb(132, 132, 132)', darker: 'rgb(30, 30, 30)' },
    { original: 'rgb(18, 52, 86)', lighter: 'rgb(54, 134, 213)', darker: 'rgb(18, 52, 86)' },
    { original: 'rgb(255, 100, 200)', lighter: 'rgb(255, 100, 200)', darker: 'rgb(197, 0, 127)' },
    { original: 'rgb(120, 255, 120)', lighter: 'rgb(120, 255, 120)', darker: 'rgb(0, 120, 0)' },
    { original: 'rgb(255, 255, 255)', lighter: 'rgb(255, 255, 255)', darker: 'rgb(0, 0, 0)' }
  ];

  const lightBackground = 'rgb(230, 230, 230)';
  const darkBackground = 'rgb(25, 25, 25)';

  it('should lighten colors until required contrast reached', () => {
    cy.mount(
      <div style={{ backgroundColor: darkBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          {expectedColorMappings.map(({ original }) => (
            <p key={original} style={{ color: original }}>{`${original} text`}</p>
          ))}
        </ReactColorA11y>
      </div>
    );

    cy.wait(100);

    expectedColorMappings.forEach(({ original, lighter }) => {
      cy.contains(`${original} text`).then(($element) => {
        expect($element).to.have.css('color', lighter);
      });
    });
  });

  it('should darken colors until required contrast reached', () => {
    cy.mount(
      <div style={{ backgroundColor: lightBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          {expectedColorMappings.map(({ original }) => (
            <p key={original} style={{ color: original }}>{`${original} text`}</p>
          ))}
        </ReactColorA11y>
      </div>
    );

    cy.wait(100);

    expectedColorMappings.forEach(({ original, darker }) => {
      cy.contains(`${original} text`).then(($element) => {
        expect($element).to.have.css('color', darker);
      });
    });
  });

  it('should handle svg fill and stroke', () => {
    cy.mount(
      <div style={{ backgroundColor: darkBackground }}>
        <ReactColorA11y flipBlackAndWhite>
          <svg height={100} width={100}>
            {expectedColorMappings.map(({ original }, index) => (
              <circle id={index.toString()} key={original} cx={50} cy={50} r={50} stroke={original} fill={original} />
            ))}
          </svg>
        </ReactColorA11y>
      </div>
    );

    cy.wait(100);

    expectedColorMappings.forEach(({ lighter }, index) => {
      cy.get(`#${index}`).then(($element) => {
        const expectedColor = colord(lighter).toHex();
        expect($element).to.have.attr('fill', expectedColor);
        expect($element).to.have.attr('stroke', expectedColor);
      });
    });
  });
});
