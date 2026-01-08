export const notificationBodyTemplateEn = `          <!-- Body content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Notification Message -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.7;">
                      {{notification_description}}
                    </p>
                  </td>
                </tr>
              </table>

              {{#has_details}}
              <!-- Details Section -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #558cc9;">
                    <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">Details</h3>
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      {{#mission_title}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Mission:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{mission_title}}</td>
                      </tr>
                      {{/mission_title}}
                      {{#report_title}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Report:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{report_title}}</td>
                      </tr>
                      {{/report_title}}
                      {{#structure_name}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Structure:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{structure_name}}</td>
                      </tr>
                      {{/structure_name}}
                      {{#professional_name}}
                      <tr>
                        <td style="padding: 8px 0; color: #555; font-size: 14px;"><strong style="color: #2c3e50;">Professional:</strong></td>
                        <td style="padding: 8px 0; color: #333; font-size: 14px;">{{professional_name}}</td>
                      </tr>
                      {{/professional_name}}
                    </table>
                  </td>
                </tr>
              </table>
              {{/has_details}}

              <!-- View in App Link -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="{{view_notification_url}}" style="display: inline-block; padding: 12px 30px; background-color: #f8f9fa; color: #558cc9; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: 2px solid #558cc9;">
                      View in App
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

`;
