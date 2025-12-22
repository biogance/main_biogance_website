"use client"

import { useState } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function TermsCondition() {
  const [activeSection, setActiveSection] = useState('disclaimer');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Mobile Navigation - Horizontal Scrollable Tabs */}
      <div className="lg:hidden sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="overflow-x-auto">
          <nav className="flex space-x-2 px-4 py-3 min-w-max">
            <button
              onClick={() => setActiveSection('disclaimer')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg ${activeSection === 'disclaimer'
                ? 'bg-gray-900 text-white font-medium'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Disclaimer
            </button>

            <button
              onClick={() => setActiveSection('shipping')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg ${activeSection === 'shipping'
                ? 'bg-gray-900 text-white font-medium'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Shipping & Return
            </button>

            <button
              onClick={() => setActiveSection('privacy')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg ${activeSection === 'privacy'
                ? 'bg-gray-900 text-white font-medium'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Privacy Policy
            </button>

            <button
              onClick={() => setActiveSection('terms')}
              className={`whitespace-nowrap px-4 py-2 text-sm rounded-lg ${activeSection === 'terms'
                ? 'bg-gray-900 text-white font-medium'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              Terms & Conditions
            </button>
          </nav>
        </div>
      </div>
      <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 mb-2 mt-6 px-8">
        {activeSection === 'disclaimer' && 'Disclaimer for BIOGANCE'}
        {activeSection === 'shipping' && 'Shipping & Return'}
        {activeSection === 'privacy' && 'Privacy Policy'}
        {activeSection === 'terms' && 'Terms & Conditions'}
      </h1>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 lg:mt-6 px-4 lg:px-0">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 sticky top-18 self-start">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('disclaimer')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer ${activeSection === 'disclaimer'
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Disclaimer for BIOGANCE
            </button>

            <button
              onClick={() => setActiveSection('shipping')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer ${activeSection === 'shipping'
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Shipping & Return
            </button>

            <button
              onClick={() => setActiveSection('privacy')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer ${activeSection === 'privacy'
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Privacy Policy
            </button>

            <button
              onClick={() => setActiveSection('terms')}
              className={`w-full text-left px-4 py-3 text-sm rounded-lg cursor-pointer ${activeSection === 'terms'
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              Terms & Conditions
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 pb-8">
          {/* Mobile Title */}
          <h1 className="lg:hidden text-xl font-bold text-gray-900 mb-4">
            {activeSection === 'disclaimer' && 'Disclaimer for BIOGANCE'}
            {activeSection === 'shipping' && 'Shipping & Return'}
            {activeSection === 'privacy' && 'Privacy Policy'}
            {activeSection === 'terms' && 'Terms & Conditions'}
          </h1>

          {activeSection === 'disclaimer' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Presentation of the site */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Presentation of the site</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Pursuant to Article 6 of Law No. 2004-575 of June 21, 2004 on confidence in the digital economy, users of the
                    website www.biogance.fr are informed of the identity of the various parties involved in its creation and monitoring:
                  </p>

                  <ul className="list-disc space-y-1 lg:space-y-2 ml-3 lg:ml-4">
                    <li>
                      Owner / Publisher of the site: <br /> BIOGANCE SAS – SIRET:  <br /> 505 166 892 00024
                      <br />
                      23 Allého Atlantique – 49123 Champtocé-sur-Loire – France
                    </li>
                    <li>Publication manager: BIOGANCE SAS</li>
                    <li>Creator / development / Agence Quaim: www.agencequaim.com</li>
                    <li>
                      Host: <br /> OVH SAS
                      <br />
                      2 rue Kellermann – 59100 Roubaix – France
                      <br />
                      Tel: 1007
                    </li>
                  </ul>
                </div>
              </div>

              {/* General conditions of use of the site */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">General conditions of use of the site</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Use of the website www.biogance.fr implies full acceptance of the general conditions of use described below. These conditions are subject
                    to change at any time. Users are therefore encouraged to consult them regularly.
                  </p>

                  <p>
                    The site is normally accessible 24/7. However, the publisher may decide to interrupt it for technical maintenance.
                  </p>
                </div>
              </div>

              {/* Description of services provided */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Description of services provided</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    The purpose of the website www.biogance.fr is to present all the activities, products and services offered by BIOGANCE
                  </p>

                  <p>
                    The information provided is for informational purposes only and may change. Although updated regularly, it may contain inaccuracies or
                    omissions.
                  </p>
                </div>
              </div>

              {/* Technical limitations */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Technical limitations</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>The site uses JavaScript technology.</p>

                  <p>
                    The user agrees to access the site with recent, up-to-date, virus-free hardware and with an up-to-date browser.
                  </p>

                  <p>
                    BIOGANCE cannot be held responsible for material damage linked to the use of the site.
                  </p>
                </div>
              </div>

              {/* Intellectual Property */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Intellectual Property</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    BIOGANCE owns the intellectual property rights to all elements of the site (texts, images, graphics, logo, icons, sounds, software, etc.).
                  </p>

                  <p>
                    Any reproduction or representation, in whole or in part, without prior written authorization is prohibited and would constitute an infringement according to articles L.335-2 et seq. of the Intellectual Property Code.
                  </p>
                </div>
              </div>

              {/* Liability */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Liability</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    BIOGANCE cannot be held responsible for any direct or indirect damage caused to the user's equipment when browsing the site, nor for any incompatibilities or bugs.
                  </p>

                  <p>
                    Interactive spaces (contact form) are available to users. BIOGANCE reserves the right to remove any content that violates the law (abusive, racist, defamatory remarks, etc.).
                  </p>
                </div>
              </div>

              {/* Personal data (RGPD) */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Personal data (RGPD)</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Personal data is collected by BIOGANCE SAS as data controller, in compliance with Regulation (EU) 2016/679 (GDPR) and the amended Data Protection Act.
                  </p>

                  <p>
                    The data is processed for the purposes of order management, customer relations, commercial prospecting (if consented to), statistics, or legal obligations.
                  </p>

                  <p>The user has the following rights:</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Right of access, rectification, erasure, opposition, limitation and portability.</li>
                  </ul>

                  <p>
                    These rights can be exercised by e-mail to: info@biogance.fr , or by post to: BIOGANCE – ZI Anjou Atlantique – 49123 Champtocé-sur-Loire – France (accompanied by proof of identity).
                  </p>
                  <p>
                    BIOGANCE does not transmit any data to third parties without consent, except where legally required or through the use of an authorized subcontractor.
                  </p>

                </div>
              </div>

              {/* Cookies */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Cookies</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    When browsing www.biogance.fr , cookies may be placed on the user's device.
                  </p>

                  <p>
                    In accordance with current regulations, cookies requiring consent (audience measurement, advertising or social media cookies) are only placed after explicit acceptance by the user via a dedicated banner.
                  </p>

                  <p>
                    The user can accept, refuse or customize their preferences at any time via the cookie banner or the “Manage my cookies” link.
                  </p>

                  <p>
                    A policy relating to cookies, detailing their use, their duration and the third parties concerned, is accessible [at this link] (to be adapted according to the dedicated page).
                  </p>
                </div>
              </div>

              {/* Applicable law and jurisdiction */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Applicable law and jurisdiction</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Any dispute relating to the use of the site is subject to French law. <br /> Before taking any legal action, the user is invited to contact our customer service. In accordance with Article L612-1 of the French Consumer  <br /> Code a mediation procedure may be initiated:
                  </p>

                  <p>
                    FEVAD Mediator <br /> BP 20015 – 75362 Paris CEDEX 8 <br /> www.mediateurfevad.fr
                  </p>

                  <p>In the absence of an amicable agreement, the French court will have sole jurisdiction.</p>
                </div>
              </div>

              {/* Reference links */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Reference Text</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-1 lg:space-y-2">
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Regulation (EU) 2016/679 of 27 April 2016 (GDPR)</li>
                    <li> Amended Data Protection Act (No. 78-17 of January 6, 1978)</li>
                    <li> Law No. 2004-575 of June 21, 2004 on confidence in the digital economy</li>
                  </ul>
                </div>
              </div>

              {/* Glossary */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Glossary</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-1 lg:space-y-2">
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>User:  Any person accessing the site www.biogance.fr</li>
                    <li>Personal data:  Information that can directly or indirectly identify a natural person</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'shipping' && (
            <div className="space-y-6 lg:space-y-8">
              {/* ORDER, VALIDATION AND PROCESSING */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">ORDER, VALIDATION AND PROCESSING</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    To place an order on www.biogance.fr , the customer must log in to their account or create one. Once the products have been added to the basket, they select the delivery method, choose the payment method, and confirm their order by checking the box "I accept the General Conditions of Sale" and validating the payment.
                  </p>

                  <p>The order is considered finalized from the moment the payment is accepted. A confirmation is then sent by email, with a summary order number.</p>

                  <p>
                    The General Conditions of Sale can be consulted at any time at the bottom of the site page.
                  </p>

                  <p>
                    As part of its efforts to combat fraud, BIOGANCE may be required to conduct additional checks. This may include requesting supporting documentation. BIOGANCE reserves the right to accept or reject an order, even after the requested documents have been provided. In the event of a check, order processing may be delayed by 24 to 48 hours.
                  </p>

                  <p>
                    BIOGANCE also reserves the right to refuse an order from a customer with whom a dispute is in progress.
                  </p>

                  <p>
                    Order processing takes place Monday through Friday, subject to product availability.
                  </p>



                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Any order placed before 11 a.m. (standard delivery) is processed within 48 hours (excluding weekends and public holidays).</li>
                    <li>Any order placed before 11 a.m. (express) is shipped the same day (excluding weekends and public holidays).</li>
                  </ul>

                  <p>
                    The customer receives an email to confirm the shipment. The invoice can be downloaded at any time from the customer area, under "My account  My orders  View invoice."
                  </p>

                  <p>
                    In the event of an error in the information entered by the customer (address, name, etc.), BIOGANCE cannot be held responsible for any failure or delay in delivery. The reshipping costs will then be borne by the customer.
                  </p>
                </div>
              </div>

              {/* DELIVERY */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">DELIVERY</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p><strong>Delivery area</strong></p>

                  <p>
                    Orders are delivered to the address indicated by the customer when ordering, in mainland France, Corsica, Germany, Belgium, Switzerland, Spain, Italy, Portugal, Luxembourg and the United Kingdom.
                  </p>

                  <p><strong>Modes and caries</strong></p>

                  <p>
                    BIOGANCE works with La Poste (Colissimo) to ensure fast and reliable delivery. <br />
                    Orders over 30 kg are not eligible for express delivery.
                  </p>



                  <p><strong>Fees and conditions</strong></p>

                  <p>
                    Shipping costs are calculated based on the total order amount, as well as the weight and volume of the items. The exact amount is displayed before confirming the order.
                  </p>

                  <p><strong>Delivery problems</strong></p>

                  <p>
                    Upon receipt of the package, if it is visibly damaged, the customer is invited to refuse delivery and immediately inform BIOGANCE Customer Service, available Monday to Friday from 9 a.m. to 12:30 p.m. and from 1:30 p.m. to 4 p.m. at 02 41 73 15 15 or by e-mail at info@biogance.fr .
                  </p>

                  <p>
                    In case of doubt, the customer can also accept the package by making specific and dated reservations on the delivery slip (e.g.: “crushed package”, “missing product”, etc.).
                  </p>

                  <p>
                    In the event of a transport dispute, an investigation may be opened with the carrier. This procedure can take up to 21 working days .
                  </p>

                  <p><strong>Force majeure</strong></p>

                  <p>
                    BIOGANCE cannot be held responsible for any delay or failure to perform (including delivery) in the event of the occurrence of an event beyond its control, qualified as force majeure within the meaning of Article 1218 of the Civil Code .
                  </p>

                  <p>
                    The following are considered to be cases of force majeure: natural disasters, fires, floods, strikes (total or partial), blockages of means of transport or supply, network or system failures, or any other situation making the performance of the contract impossible or excessively difficult.
                  </p>

                  <p>
                    In these situations, BIOGANCE's obligations are suspended for the duration of the event. If the force majeure situation continues beyond 30 days, either party may terminate the order in question without compensation.
                  </p>

                </div>
              </div>

              {/* RIGHT OF WITHDRAWAL */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">RIGHT OF WITHDRAWAL</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    In accordance with Articles L221-18 to L221-28 of the Consumer Code, the individual customer has a period of 14 calendar days from receipt of their order to exercise their right of withdrawal, without having to provide a reason for their decision.
                  </p>

                  <p>
                    To exercise this right, the customer may inform BIOGANCE of their decision by any clear and unambiguous written means (email, mail, or form available upon request). Once the request has been made, the customer has an additional 14 days to return the products.
                  </p>

                  <p>
                    Return costs are the responsibility of the customer.
                  </p>

                  <p>
                    Products must be returned complete, in their original condition (unused), with their packaging, accessories and instructions. Damaged, soiled or incomplete products will not be refunded.
                  </p>

                  <p> <strong>
                    Exceptions to the right of withdrawal
                  </strong>
                  </p>

                  <p>
                    In accordance with Article L221-28 of the Consumer Code, the right of withdrawal does not apply to products opened after delivery and which cannot be returned for reasons of hygiene or health protection (in particular care and cosmetic products for animals).
                  </p>

                  <p>
                    BIOGANCE will refund the amount paid for the products in question, as well as standard delivery charges (excluding express options), no later than 14 days after the products have been returned or proof of shipment has been provided. The refund will be made using the same payment method used for the purchase.
                  </p>

                  <p>
                    The customer may be held liable in the event of depreciation of the product resulting from handling other than that necessary to ensure its nature, characteristics and proper functioning.
                  </p>

                  <p>
                    Withdrawal form <br />Model withdrawal form. <br />You can use it, but it is not mandatory.
                  </p>

                  <p>
                    (Please complete and return this form only if you wish to withdraw from the contract)
                  </p>

                  <p>
                    — To: Biogance, Zone Industrielle Anjou Atlantique, 49123 Champtocé-sur-Loire, France or by email at info@biogance.fr
                  </p>

                  <p>
                    — I/We (*) hereby notify you of my/our (*) withdrawal from the contract for the sale of the goods (*)/for the provision of the service (*) below:
                  </p>

                  <p>
                    After 14 Handling, under post at which it - confirmation) even for contact the use of the order it (The to calculate of the exercise of 1
                    followe:
                  </p>

                  <p>
                    — Ordered on (*)/received on (*)
                  </p>

                  <p>
                    — Name of consumer(s)
                  </p>

                  <p>
                    - Address of Consumers
                  </p>

                  <p>
                    — Signature of the consumer(s) (only if this form is notified on paper)
                  </p>

                  <p>
                    - Date
                  </p>

                  <p>
                    (*) Delete as appropriate.
                  </p>
                </div>
              </div>

              {/* CLAIMS AND DISPUTE RESOLUTION */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">CLAIMS AND DISPUTE RESOLUTION</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    For any complaints, the customer can contact our customer service at the following address: <br />BIOGANCE – ZI Anjou Atlantique, 49123 Champtocé-sur-Loire <br />Or by e-mail at: info@biogance.fr
                  </p>

                  <p>
                    In accordance with articles L612-1 et seq. of the Consumer Code , in the event of an unresolved dispute after contacting our customer service, the customer has the option of using a mediation service free of charge.
                  </p>

                  <p>
                    BIOGANCE adheres to the e-commerce mediator service of FEVAD (Federation of e-commerce and distance selling), whose contact details are as follows: <br />Consumer mediator FEVAD<br />BP 20015 – 75362 Paris CEDEX 8 <br />www.mediateurfevad.fr
                  </p>

                  <p>
                    Before contacting the mediator, a written request to our customer service is mandatory.
                  </p>

                  <p>
                    The customer can also use the European online dispute resolution (ODR) platform accessible here: https://ec.europa.eu/consumers/odr/
                  </p>

                  <p>
                    In the event of failure of mediation or an amicable solution, the dispute will be brought before the competent French courts , in accordance with the applicable legal rules.
                  </p>

                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Privacy Policy Header */}
              <div className=" rounded-lg p-4 lg:p-2">
                <h2 className="text-base lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">Privacy Policy</h2>
                <p className="text-xs lg:text-sm text-gray-700 mb-2">Last updated: 06/29/2020</p>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    As Biogance SAS , the protection of your personal data is a priority. This privacy policy informs you about how your data is collected, used and
                    shared when you visit our website www.biogance.fr
                  </p>
                </div>
              </div>

              {/* Who are we? */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Who are we ?</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>Biogance SAS</p>
                  <p>Z.I Anjou Atlantique, 49123 Champtocé-sur-Loire</p>
                  <p>info@biogance.fr</p>
                </div>
              </div>

              {/* Comments */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Comments</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    When you leave a comment on our site, the data entered in the comment form, but also your IP address and the user agent of your browser are collected to help us detect unwanted comments.
                  </p>

                  <p>
                    An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: https://automattic.com/privacy/. After approval of your comment, your profile picture will be publicly visible in the context of your comment.
                  </p>
                </div>
              </div>

              {/* Media */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Media</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    If you upload images to the website, we advise you to avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images.
                  </p>
                </div>
              </div>

              {/* Cookies */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Cookies</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
                  </p>

                  <p>
                    If you visit the login page, a temporary cookie will be set to determine if your browser accepts cookies. This cookie contains no personal data and will be discarded when you close your browser.
                  </p>

                  <p>
                    When you log in, we will set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.
                  </p>

                  <p>
                    By editing or publishing a post, an additional cookie will be saved in your browser. This cookie does not include any personal data. It simply indicates the post ID of the post you just edited. It expires after 1 day.
                  </p>
                </div>
              </div>

              {/* Embedded content from other sites */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Embedded content from other sites</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
                  </p>

                  <p>
                    These websites may collect data about you, use cookies, embed third-party tracking tools, and track your interactions with this embedded content if you have an account connected to their website.
                  </p>
                </div>
              </div>

              {/* Use and transmission of your personal data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Use and transmission of your personal data</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    If you request a password reset, your IP address will be included in the reset email..
                  </p>
                </div>
              </div>

              {/* Services used */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Services used</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    We use the following services, which may process certain data:
                  </p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Google Analytics, to analyze audience and improve the site.</li>
                    <li>Brevo (ex-Sendinblue): for managing our email campaigns and newsletters.</li>
                  </ul>

                  <p>
                    These providers comply with GDPR requirements.
                  </p>
                </div>
              </div>

              {/* Storage durations of your data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Storage durations of your data</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can automatically recognize and approve any follow-up comments instead of holding them in a moderation queue.
                  </p>

                  <p>
                    For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.
                  </p>
                </div>
              </div>

              {/* Security of your data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Security of your data</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Your data is stored securely. We work with a specialized cybersecurity agency to ensure its protection against loss, unauthorized access, or disclosure.
                  </p>
                </div>
              </div>

              {/* The rights you have over your data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">The rights you have over your data</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    In accordance with the GDPR, you have the following rights:
                  </p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Access to your data</li>
                    <li>Correction</li>
                    <li>Deletion</li>
                    <li>Portability</li>
                    <li>Objection to or restriction of processing</li>
                  </ul>

                  <p>
                    To exercise your rights, contact us at info@biogance.fr. We will respond within 30 days.
                  </p>
                </div>
              </div>

              {/* Transmission of your personal data */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">Transmission of your personal data</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    Visitor comments may be checked through an automated spam detection service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'terms' && (
            <div className="space-y-6 lg:space-y-8">
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">SCOPE OF APPLICATION AND MODIFICATION OF THE GENERAL CONDITIONS OF SALE</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    These General Conditions of Sale (GCS) define the rules applicable between BIOGANCE and its customers for any order placed on the site www.biogance.fr .
                  </p>

                  <p>
                    By ordering from our site, you fully and unreservedly accept these T&Cs.
                  </p>

                  <p>
                    BIOGANCE reserves the right to update them at any time. In the event of a change, the General Terms and Conditions in effect on the day of the order will apply.
                  </p>

                  <p>
                    These conditions apply only to individuals residing in mainland France. The prices displayed on the site are reserved exclusively for them.
                  </p>
                </div>
              </div>

              {/* PRODUCTS & PRICE */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">PRODUCTS & PRICE</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    All products offered by BIOGANCE comply with current French legislation and meet applicable standards, particularly in terms of animal health, hygiene and safety.
                  </p>

                  <p>
                    BIOGANCE reserves the right to modify its catalog at any time, without notice: this includes the addition, updating or removal of product references.
                  </p>

                  <p>
                    The prices displayed on www.biogance.fr are indicated in euros, all taxes included (TTC), excluding delivery costs.
                  </p>

                  <p>
                    The total amount shown at checkout includes details of the selected products, any discounts, and applicable shipping costs. Discount codes cannot be combined and are subject to terms of use (validity, minimum amount, etc.). It is the customer's responsibility to check these terms before use.
                  </p>

                  <p>
                    BIOGANCE reserves the right to change its prices at any time, without notice. However, products are invoiced based on the price in effect at the time of the order.
                  </p>

                  <p>
                    Pictures in our is that in the form of order.
                  </p>

                  <p>
                    For any order delivered outside of France, customs duties or other local taxes may apply and remain the responsibility of the customer. The customer is invited to inquire with the competent authorities in their country.
                  </p>
                </div>
              </div>

              {/* PAYMENT AND SECURITY */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">PAYMENT AND SECURITY</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p><strong>Payment methods</strong></p>

                  <p>
                    Payment for orders can be made using the following options:
                  </p>

                  <p><strong>For Individuals:</strong></p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Bank card (Visa, Mastercard, American Express)</li>
                    <li>PayPal</li>
                  </ul>

                  <p><strong>For professionals:</strong></p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Bank card (Visa, Mastercard, American Express)</li>
                    <li>PayPal</li>
                    <li>Bank transfer (RIB provided on request)</li>
                    <li>Credit card even is SEPARATE details to BIOGANCE — 23 Allée Atlantique – 49123 Champtocé-sur-Loire, France)</li>
                  </ul>

                  <p>
                    Orders paid by check are shipped only after payment has been received and validated. For any order over €150, shipping is only made after the check has cleared. The customer's name and order number must appear on the back of the check. Checks are held for 7 days; after this period, the order is automatically canceled.
                  </p>

                  <p> <strong> Secure Payment </strong></p>

                  <p>
                    Credit card transactions are completely secure. Your details are encrypted using the SSL (Secure Socket Layer) protocol and are never transmitted in clear text. BIOGANCE has no access to your banking information at any time.
                  </p>

                  <p>
                    To enhance security, we use the 3D Secure (Verified by Visa / MasterCard SecureCode) system. It allows your bank to verify your identity through an authentication step (code received by SMS, date of birth, password, etc.).
                  </p>

                  <p>
                    If 3D Secure authentication fails, the order cannot be completed.
                  </p>
                </div>
              </div>

              {/* RESERVATION OF OWNERSHIP */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">RESERVATION OF OWNERSHIP</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    In accordance with article 2367 of the Civil Code, BIOGANCE remains the owner of the products delivered until full and effective payment of their price, including costs.
                  </p>

                  <p>
                    Until full payment is received, the customer agrees not to resell, transform, pledge, or transfer the products in any way whatsoever. In the event of non-payment, BIOGANCE reserves the right to reclaim the products.
                  </p>
                  <p>
                    Payment is considered to have been made only after actual collection of the sums due on the BIOGANCE account.
                  </p>
                </div>
              </div>

              {/* LEGAL GUARANTEES */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">LEGAL GUARANTEES</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    In accordance with the legal provisions in force, all products sold by BIOGANCE benefit from two legal guarantees:
                  </p>


                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>the guarantee of conformity (articles L217-1 to L217-32 of the Consumer Code).</li>
                    <li>the guarantee against hidden defects (articles 1641 to 1649 of the Civil Code).</li>
                  </ul>

                  <p> <strong> -Legal guarantee of conformity </strong></p>
                  <p>
                    In the event of a non-compliant product (defective or not corresponding to the order), the customer can request a replacement or refund , free of charge.
                  </p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>The customer has 2 years from receipt of the product to claim this guarantee.</li>
                    <li>No proof of the defect is required during the first 12 months following delivery (except for used goods).</li>
                  </ul>

                  <p>
                    This warranty applies independently of any commercial warranty.
                  </p>
                  <p> <strong> -Legal guarantee against hidden defects </strong></p>
                  <p>
                    If the product has a defect making its use impossible or significantly impaired, the customer can call on the guarantee against hidden defects within 2 years of discovering the defect .</p>
                  <p>
                    He can ask:</p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>either full reimbursement upon return of the product,</li>
                    <li>or a reduction in price if the product is kept (article 1644 of the Civil Code).</li>
                  </ul>

                  <p> <strong> -Conditions of implementation </strong></p>


                  <p>
                    For any inquiries related to these guarantees, the customer can contact BIOGANCE customer service and return the products with proof of purchase. Return shipping costs will be refunded if the guarantee is accepted.
                  </p>

                  <p>
                    These guarantees do not affect the right of withdrawal provided for in Article 6.
                  </p>
                </div>
              </div>

              {/* APPLICABLE LAW AND LANGUAGE OF THE CONTRACT */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">APPLICABLE LAW AND LANGUAGE OF THE CONTRACT</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    These General Conditions of Sale are governed by French law .
                  </p>

                  <p>
                    In the event of translation, only the version written in French is authentic.
                  </p>
                </div>
              </div>

              {/* PERSONAL DATA SCOPE */}
              <div className="border border-gray-200 rounded-lg p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4">PERSONAL DATA SCOPE</h2>
                <div className="text-xs lg:text-sm text-gray-700 space-y-2 lg:space-y-3">
                  <p>
                    BIOGANCE collects and processes the personal data of its customers in compliance with Regulation (EU) 2016/679 of April 27, 2016, known as GDPR , and the amended Data Protection Act .
                  </p>

                  <p>
                    The information collected is used only for order management, customer relations, commercial communication (if accepted), or to meet legal obligations.
                  </p>
                  <p> <strong> -Your rights </strong></p>

                  <p>
                    The customer has the following rights over his data at any time:</p>

                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>Right of access, rectification, opposition, erasure,</li>
                    <li>Right to restriction of processing,</li>
                    <li>Right to Data portability</li>
                  </ul>

                  <p>
                    These rights can be exercised:
                  </p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>by mail: BIOGANCE – ZI Anjou Atlantique, 49123 Champtocé-sur-Loire, France</li>
                    <li>by email: info@biogance.fr</li>
                  </ul>

                  <p>
                    The request must specify the subject, the customer's full contact details, and be accompanied by proof of identity. A response will be provided within a maximum of 1 month , extendable to 2 months if necessary in the case of a complex request.
                  </p>

                  <p> <strong>-Marketing communication </strong></p>
                  <p>The customer can unsubscribe from communications (newsletter, offers, SMS) at any time:</p>
                  <ul className="list-disc ml-4 lg:ml-6 space-y-1">
                    <li>via their customer account in the “My Account” section;</li>
                    <li>or directly by clicking on the unsubscribe links present in each email/SMS;</li>
                    <li>or by contacting BIOGANCE by email or mail.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}