export interface GeneralParams {
  /**
   * Protocol Version
   */
  v: '1'

  /**
   * Tracking ID
   */
  tid: string;

  /**
   * Data Source
   */
  ds?: 'web' | 'app'

  /**
   * Cache Buster
   *
   * Used to send a random number in GET requests to ensure browsers and proxies don't cache hits.
   * It should be sent as the final parameter of the request since we've seen some 3rd party internet filtering software add additional parameters to HTTP requests incorrectly.
   *
   * This value is not used in reporting.
   */
  z?: string
}

export interface VisitorOptions {
  /**
   * Client ID
   */
  cid?: string;
  /**
   * User ID
   */
  uid?: string;
}

export interface SessionParams {
  /**
   * Session Control
   *
   * Used to control the session duration.
   * A value of 'start' forces a new session to start with this hit and 'end' forces the current session to end with this hit.
   * All other values are ignored.
   */
  sc?: 'start' | 'end'
}

export interface TrafficSourcesParams {
  /**
   * Document Referrer
   */
  dr?: string
}

export interface SystemInfoParams {
  /**
   * Screen Resolution
   * Specifies the screen resolution.
   */
  sr?: `${number}x${number}`

  /**
   * Viewport size
   * Specifies the viewable area of the browser / device.
   */
  vp?: `${number}x${number}`

  /**
   * User Language
   */
  ul?: string
}

interface HitParams extends SystemInfoParams, TrafficSourcesParams, SessionParams, VisitorOptions, GeneralParams {
  /**
   * Hit type
   */
  t: 'pageview' | 'screenview' | 'event' | 'transaction' | 'item' | 'social' | 'exception' | 'timing'

  /**
   * Non-Interaction Hit
   *
   * Specifies that a hit be considered non-interactive.
   */
  ni?: boolean

  /**
   * Custom dimension
   * shiki_account_state
   */
  cd1?: string

  /**
   * Custom dimension
   * video_thumbnails_state
   */
  cd2?: string

  /**
   * Custom dimension
   * hardware_acceleration_state
   */
  cd3?: string
}

export interface PageViewParams extends HitParams {
  t: 'pageview'
  /**
   * Document Path
   *
   * The path portion of the page URL. Should begin with '/'.
   *
   * Max length: 2048 Bytes
   */
  dp?: string;
  /**
   * Document Host Name
   *
   * Specifies the hostname from which content was hosted.
   *
   * Max length: 100 Bytes
   */
  dh?: string;
  /**
   * Document Title
   *
   * The title of the page / document.
   *
   * Max length: 1500 Bytes
   */
  dt?: string;
  /**
   * Document location URL
   *
   * Use this parameter to send the full URL (document location) of the page on which content resides.
   *
   * Max length: 2048 Bytes
   */
  dl?: string;
}

export interface ScreenViewParams extends HitParams {
  t: 'screenview'
  /**
   * Screen Name
   *
   * This parameter is optional on web properties, and required on mobile properties for screenview hits,
   * where it is used for the 'Screen Name' of the screenview hit.
   *
   * Max length: 2048 Bytes
   *
   * Example value: `High Scores`
   */
  cd?: string;
  /**
   * Application Name
   *
   * Specifies the application name. This field is required for any hit that has app related data
   * (i.e., app version, app ID, or app installer ID). For hits sent to web properties, this field is optional.
   *
   * Max length: 100 Bytes
   *
   * Example value: `My App`
   */
  an?: string;
  /**
   * Application Version
   *
   * Specifies the application version.
   *
   * Max length: 100 Bytes
   *
   * Example value: `1.2`
   */
  av?: string;
  /**
   * Application ID
   *
   * Application identifier.
   *
   * Max length: 150 Bytes
   *
   * Example value: `com.company.app`
   */
  aid?: string;
  /**
   * Application Installer ID
   *
   * Application installer identifier.
   *
   * Max length: 150 Bytes
   *
   * Example value: `com.platform.vending`
   */
  aiid?: string;
}

export interface EventParams extends HitParams {
  t: 'event'
  /**
   * Event Category
   *
   * **Required for event hit type.**
   *
   * Specifies the event category. Must not be empty.
   *
   * Max length: 150 Bytes
   *
   * Example value: `Category`
   */
  ec: string;
  /**
   * Event Action
   *
   * **Required for event hit type.**
   *
   * Specifies the event action. Must not be empty.
   *
   * Max length: 500 Bytes
   *
   * Example value: `Action`
   */
  ea: string;
  /**
   * Event Label
   *
   * Specifies the event label.
   *
   * Max length: 500 Bytes
   *
   * Example value: `Label`
   */
  el?: string;
  /**
   * Event Value
   *
   * Specifies the event value. Values must be non-negative.
   *
   * Example value: `55`
   */
  ev?: string | number;
}

export interface ExceptionParams extends HitParams {
  t: 'exception'
  /**
   * Exception Description
   *
   * Specifies the description of an exception.
   *
   * Max length: 150 Bytes
   *
   * Example value: `DatabaseError`
   */
  exd?: string;
  /**
   * Is Exception Fatal?
   *
   * Specifies whether the exception was fatal.
   */
  exf?: boolean;
}

export interface TimingParams extends HitParams {
  t: 'timing'
  /**
   * User timing category
   *
   * **Required for timing hit type.**
   *
   * Specifies the user timing category.
   *
   * Max length: 150 Bytes
   *
   * Example value: `category`
   */
  utc?: string;
  /**
   * User timing variable name
   *
   * **Required for timing hit type.**
   *
   * Specifies the user timing variable.
   *
   * Max length: 500 Bytes
   *
   * Example value: `lookup`
   */
  utv?: string;
  /**
   * User timing time
   *
   * **Required for timing hit type.**
   *
   * Specifies the user timing value. The value is in milliseconds.
   *
   * Example value: `123`
   */
  utt?: string | number;
  /**
   * User timing label
   *
   * Specifies the user timing label.
   *
   * Max length: 500 Bytes
   *
   * Example value: `label`
   */
  utl?: string;
}

// type Hit =
// export type MpParams = PageViewParams | ScreenViewParams | EventParams | TimingParams
//
// var a : PageViewParams | ScreenViewParams
//
// a = {t: 'pageview'};
// console.log(a.t);
