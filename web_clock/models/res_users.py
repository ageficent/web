# Copyright 2019 Eficent Business and IT Consulting Services S.L.
#   (http://www.eficent.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).#

from odoo import fields, models


class User(models.Model):
    _inherit = "res.users"

    def get_timezone(self):
        return self.env['res.users'].browse(self.env.uid).tz_offset
