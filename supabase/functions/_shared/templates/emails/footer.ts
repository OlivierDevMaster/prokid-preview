export const footerTemplate = `          <!-- Footer content -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e0e0e0; background-color: #f9f9f9;">
              <p style="margin: 0 0 10px 0; color: #7f8c8d; font-size: 13px; line-height: 1.6;">
                {{footer_text}}
              </p>
            </td>
          </tr>
          <!-- Footer links and contact -->
          <tr>
            <td style="padding: 25px 40px; background-color: #f5f5f5; border-top: 1px solid #e0e0e0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 0; text-align: center;">
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 12px; line-height: 1.6;">
                      <a href="[PRIVACY_POLICY_URL_PLACEHOLDER]" style="color: #558cc9; text-decoration: none; margin: 0 15px;">Politique de confidentialité</a>
                      <span style="color: #ccc;">|</span>
                      <a href="[CONTACT_URL_PLACEHOLDER]" style="color: #558cc9; text-decoration: none; margin: 0 15px;">Nous contacter</a>
                    </p>
                    <p style="margin: 0; color: #999; font-size: 11px;">
                      prokid - [CONTACT_EMAIL_PLACEHOLDER]<br />
                      [CONTACT_ADDRESS_PLACEHOLDER]
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
