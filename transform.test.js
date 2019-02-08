const transform = require('./transform');

describe('transform', () => {
  it('simple class no vars', () => {
    expect(
      transform(
        `.button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('nested class no vars', () => {
    expect(
      transform(
        `.button {
          display: flex;
          align-items: center;
          justify-content: center;

          .foo {
            display: block;
          }
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('sass vars to import', () => {
    expect(
      transform(
        `.button {
          color: $fe-brary-colour-primary-dark;
          display: flex;

          .bar {
            font-size: $fe-brary-font-h6-font-size;
          }
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('placeholder', () => {
    expect(
      transform(
        `// this comment would cause issues using the postcss parser vs postcss-scss
        %message-shared {
          border: 1px solid #ccc;
          padding: 10px;
          color: #333;
        }

        .message {
          @extend %message-shared;
        }

        .success {
          @extend %message-shared;
          border-color: green;
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('mixin refrenced does not export', () => {
    expect(
      transform(
        `@mixin ad-exact($width, $height) {
          width: $width;
          height: $height;
          color: $fe-brary-colour-primary-dark;
        }

        .adspot-468x60_728x90-pos-1-container {
          color: blue;
          @include ad-exact(125px, 700px);
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('mixin exported when not refrenced in file', () => {
    expect(
      transform(
        `@mixin ad-exact($width, $height) {
          width: $width;
          height: $height;
          color: $fe-brary-colour-primary-dark;
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('mixins nested', () => {
    expect(
      transform(
        `@mixin ad-exact($width, $height) {
          width: $width;
          height: $height;

          .bar {
            color: $fe-brary-colour-primary-dark;
            display: flex;
            align-items: center;

            .foo {
              display: black;
              align-items: start;
            }
          }

          display: block;
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('non classname', () => {
    expect(
      transform(
        `.listing-details__description {
            margin-bottom: 24px;

            ::hover {
              color: pink;
            }

            .foo {
              margin-bottom: 100px;
            }

            p {
              margin-bottom: 55px;
            }
          }`,
      ),
    ).toMatchSnapshot();
  });

  it('vanilla css media query', () => {
    expect(
      transform(
        `.search-results__auctions-label {
           display: none;

           @media(min-width: 100px) {
             display: inline;
           }
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('custom vars', () => {
    expect(
      transform(
        `.search-results__auctions-label {
           display: none;
           color: $foo-bar-baz-whizz;
        }`,
      ),
    ).toMatchSnapshot();
  });

  it('custom vars in include', () => {
    expect(
      transform(
        `.listing-details__map-marker {
            $map-marker-arrow-size: 8px;

            &::after {
              @include simple-arrow($map-marker-arrow-size, $map-marker-arrow-size, 'down', $fe-brary-colour-white);
              margin-left: $map-marker-arrow-size;
            }
          }`,
      ),
    ).toMatchSnapshot();
  });

  describe('pesudo elements/classes', () => {
    it('nested', () => {
      expect(
        transform(`
          .listing-details__button-copy {
            background: none;
            border: 0;

            &:focus,
            &:hover {
              outline: 0;
            }

            .domain-icon {
              width: 14px;
              height: 14px;
            }
          }
          `),
      ).toMatchSnapshot();
    });

    it('class nested in pseudo becomes a ref', () => {
      expect(
        transform(`
          .listing-details__button-copy {
            display: flex;
            cursor: pointer;

            &:hover {
              .listing-details__button-icon {
                opacity: 1;
                transform: translateX(0);
              }
            }
          }
          `),
      ).toMatchSnapshot();
    });

    it('nested pseudos are kept', () => {
      expect(
        transform(`
          .listing-details__additional-link {
            margin-left: auto;

            &:not(:last-of-type) {
              padding-right: 12px;

              &::after {
                height: 18px;
                content: '';
              }
            }
          }
        `),
      ).toMatchSnapshot();
    });

    it('top level pseudo classes', () => {
      expect(
        transform(`
          .listing-details__agent-details-right-arrow:first-of-type {
            color: black;
          }
        `),
      ).toMatchSnapshot();
    });
  });

  describe('custom include-media', () => {
    it('min-width', () => {
      expect(
        transform(
          `.search-results__auctions-label {
             display: none;

             @include media('>=desktop') {
               display: inline;
             }
          }`,
        ),
      ).toMatchSnapshot();
    });
    it('max-width', () => {
      expect(
        transform(
          `.search-results__auctions-label {
             display: none;

             @include media('<desktop') {
               display: inline;
             }
          }`,
        ),
      ).toMatchSnapshot();
    });
    it('unrecognised', () => {
      expect(() => {
        transform(
          `.search-results__auctions-label {
             display: none;

             @include media('>=desktop', 'landscape') {
               display: inline;
             }
          }`,
        );
      }).toThrow();
    });
  });

  it('top level vars', () => {
    expect(
      transform(`
        $foo-bar-baz: 42px;
      `),
    ).toMatchSnapshot();
  });

  it('top level vars ref', () => {
    expect(
      transform(`
        $foo-bar-baz: 42px;

        .foo {
          height: $foo-bar-baz;
          width: $external-var;
        }
      `),
    ).toMatchSnapshot();
  });

  it('does not export placeholder if its being used in the file', () => {
    expect(
      transform(`
        %fe-pa-listing-details-main {
          padding: 18px 0;
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
        }

        .foo {
          @extend %fe-pa-listing-details-main;
        }
      `),
    ).toMatchSnapshot();
  });

  it('exports placeholder if its not being used in the file', () => {
    expect(
      transform(`
        %fe-pa-listing-details-main {
          padding: 18px 0;
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
        }
      `),
    ).toMatchSnapshot();
  });

  it('handles multi value var refrences', () => {
    expect(
      transform(`
        .foo {
          border-bottom: 1px solid $fe-brary-colour-neutral-300;
        }
      `),
    ).toMatchSnapshot();
  });

  it('imports fe-brary helpers', () => {
    expect(
      transform(`
        .listing-details__agent-details-right-arrow {
          @extend %button-normalize;
          position: absolute;
        }
      `),
    ).toMatchSnapshot();
  });

  it('imports fe-brary helpers and vars', () => {
    expect(
      transform(`
        .listing-details__agent-details-right-arrow {
          @extend %button-normalize;
          color: $fe-brary-colour-primary-dark;
        }
      `),
    ).toMatchSnapshot();
  });
});
