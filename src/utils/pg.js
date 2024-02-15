import Razorpay from 'razorpay'
import { nanoid } from 'nanoid'
import axios from 'axios'

const createPaymentLink = async (body) => {
    let reference_id = nanoid()
    let { name, phone, amount } = body
    try {
        // let body = {
        //     amount,
        //     currency: "INR",
        //     accept_partial: false,
        //     reference_id,
        //     customer: {
        //       name,
        //       contact: phone,
        //     },
        //     notify: {
        //       sms: true,
        //     },
        //     reminder_enable: true,
        //     callback_url: "https://example-callback-url.com/",
        //     callback_method: "get"
        // }   //Uncomment for payment link
        let body = {
            amount: 1000,
            currency: 'INR',
            receipt: reference_id,
        }
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        })
        // let response = await razorpay.paymentLink.create(
        //     body
        // )
        let response = await razorpay.orders.create(body)
        console.log({ response })
        return response
    } catch (err) {
        console.log({ Error: err })
        return err
    }
}

const checkAndActivateWebhook = async () => {
    try {
        const headers = {
            Authorization: `Basic ${Buffer.from(
                process.env.RAZORPAY_KEY + ':' + process.env.RAZORPAY_SECRET
            ).toString('base64')}`,
        }
        let webhookUrl = process.env.WEBHOOK_URL
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        })

        const response = await axios.get(process.env.RAZORPAY_URL, { headers })
        const existingWebhook = response.data.items.find(
            (webhook) => webhook.url === webhookUrl
        )
        console.log({ existingWebhook })
        if (existingWebhook) {
            if (!existingWebhook.active) {
                // Delete the existing webhook
                await axios.delete(
                    `https://api.razorpay.com/v1/webhooks/${existingWebhook.id}`,
                    {
                       headers
                    }
                )
                console.log('Webhook deleted')

                // Create a new webhook with the desired settings
                const events = ['payment.authorized', 'payment.failed'] // Example events
                const createResponse = await razorpay.webhooks.create({
                    url: webhookUrl,
                    events,
                })
                console.log('Webhook created:', createResponse)
            } else {
                console.log('Webhook is already enabled:', existingWebhook)
            }
        } else {
            // Subscribe to desired events
            const events = [
                'payment.authorized',
                'payment.failed',
                'payment.captured',
                'order.paid',
            ] // Example events // Example events
            const createResponse = await razorpay.webhooks.create({
                url: webhookUrl,
                events,
            })
            console.log('Webhook created:', createResponse)
        }
    } catch (error) {
        console.error(
            'Error checking/activating webhook:',
            error.response ? error.response.data : error.message
        )
    }
}

export default { createPaymentLink, checkAndActivateWebhook }
