
import {
  pageViewTracking,
  loadFacebookEvents,
} from '../utils/tracking'

loadFacebookEvents()

pageViewTracking().then(response => {
  if (!response.succeeded) return

  // const {
  //   meta,
  // } = response.data

  // if (!fbq) return
  //
  // fbq('init' , meta.app_id, meta.customer_data ?? {})
  //
  // fbq('track', 'PageView', {}, {
  //   eventID: meta.event_id,
  // })
})
